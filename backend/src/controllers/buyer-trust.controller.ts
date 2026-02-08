import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { riskEngine } from '../services/risk-engine.service';

const prisma = new PrismaClient();

/**
 * Buyer Trust Score Controller
 * Handles buyer trust score and payment method queries
 */

/**
 * Get Buyer Trust Score
 * Returns current trust score for a buyer
 */
export const getBuyerTrustScore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { userId: id },
      select: {
        trustScore: true,
        totalOrders: true,
        returnedOrders: true,
        cancelledOrders: true,
        lastScoreUpdate: true,
        createdAt: true,
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Calculate account age in days
    const accountAgeDays = Math.floor(
      (Date.now() - customer.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const successRate = customer.totalOrders > 0
      ? ((customer.totalOrders - customer.returnedOrders) / customer.totalOrders) * 100
      : 0;

    return res.json({
      success: true,
      data: {
        userId: id,
        trustScore: customer.trustScore,
        scoreCategory: customer.trustScore > 0.8
          ? 'PLATINUM'
          : customer.trustScore > 0.5
          ? 'STANDARD'
          : 'HIGH_RISK',
        stats: {
          totalOrders: customer.totalOrders,
          returnedOrders: customer.returnedOrders,
          cancelledOrders: customer.cancelledOrders,
          successRate: successRate.toFixed(2) + '%',
          accountAgeDays,
        },
        lastUpdated: customer.lastScoreUpdate,
      },
    });
  } catch (error: any) {
    console.error('Error fetching buyer trust score:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get Available Payment Methods
 * Returns payment methods based on trust score
 */
export const getAvailablePaymentMethods = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { orderTotal } = req.query;

    const customer = await prisma.customer.findUnique({
      where: { userId: id },
      select: {
        trustScore: true,
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    const score = customer.trustScore;
    const paymentMethods = riskEngine.getPaymentMethods(score);
    
    const total = orderTotal ? parseFloat(orderTotal as string) : 0;
    const commitmentFee = riskEngine.getCommitmentFee(score, total);

    return res.json({
      success: true,
      data: {
        userId: id,
        trustScore: score,
        scoreCategory: score > 0.8
          ? 'PLATINUM'
          : score > 0.5
          ? 'STANDARD'
          : 'HIGH_RISK',
        paymentMethods,
        codAvailable: paymentMethods.includes('COD') || paymentMethods.includes('COD_WITH_DEPOSIT'),
        commitmentFee,
        message: commitmentFee > 0
          ? `COD available with ₹${commitmentFee} commitment fee`
          : score > 0.8
          ? 'All payment methods available'
          : 'COD not available for your account',
      },
    });
  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Refresh Buyer Trust Score
 * Recalculates trust score based on latest data
 */
export const refreshTrustScore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { pincode } = req.body;

    if (!pincode) {
      return res.status(400).json({
        success: false,
        message: 'Pincode is required',
      });
    }

    const newScore = await riskEngine.calculateAndUpdateBuyerScore(id, pincode);

    return res.json({
      success: true,
      message: 'Trust score updated successfully',
      data: {
        userId: id,
        trustScore: newScore,
        scoreCategory: newScore > 0.8
          ? 'PLATINUM'
          : newScore > 0.5
          ? 'STANDARD'
          : 'HIGH_RISK',
        updatedAt: new Date(),
      },
    });
  } catch (error: any) {
    console.error('Error refreshing trust score:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get Pincode Risk Score
 * Returns risk score for a specific pincode
 */
export const getPincodeRisk = async (req: Request, res: Response) => {
  try {
    const { pincode } = req.params;

    const riskData = await prisma.pincodeRisk.findUnique({
      where: { pincode },
    });

    if (!riskData) {
      return res.json({
        success: true,
        data: {
          pincode,
          riskScore: 0.5, // Default for unknown pincodes
          riskCategory: 'MEDIUM',
          message: 'No historical data available for this pincode',
        },
      });
    }

    const riskCategory = riskData.riskScore > 0.7
      ? 'HIGH'
      : riskData.riskScore > 0.4
      ? 'MEDIUM'
      : 'LOW';

    return res.json({
      success: true,
      data: {
        pincode,
        riskScore: riskData.riskScore,
        riskCategory,
        stats: {
          totalOrders: riskData.totalOrders,
          returnedOrders: riskData.returnedOrders,
          cancelledOrders: riskData.cancelledOrders,
          returnRate: ((riskData.returnedOrders / riskData.totalOrders) * 100).toFixed(2) + '%',
        },
        lastUpdated: riskData.lastUpdated,
      },
    });
  } catch (error: any) {
    console.error('Error fetching pincode risk:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Update Order Outcome
 * Updates trust score and pincode risk after order completion
 */
export const updateOrderOutcome = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { wasReturned, wasCancelled } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          include: {
            customer: true,
          },
        },
        shippingAddress: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const customer = order.user.customer;
    if (!customer) {
      return res.status(400).json({
        success: false,
        message: 'Customer profile not found',
      });
    }

    // Update customer stats
    await prisma.customer.update({
      where: { userId: order.userId },
      data: {
        returnedOrders: wasReturned
          ? customer.returnedOrders + 1
          : customer.returnedOrders,
        cancelledOrders: wasCancelled
          ? customer.cancelledOrders + 1
          : customer.cancelledOrders,
      },
    });

    // Update pincode risk
    await riskEngine.updatePincodeRisk(
      order.shippingAddress.pincode,
      wasReturned,
      wasCancelled
    );

    // Recalculate trust score
    const newScore = await riskEngine.calculateAndUpdateBuyerScore(
      order.userId,
      order.shippingAddress.pincode
    );

    return res.json({
      success: true,
      message: 'Order outcome recorded successfully',
      data: {
        orderId,
        newTrustScore: newScore,
        wasReturned,
        wasCancelled,
      },
    });
  } catch (error: any) {
    console.error('Error updating order outcome:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
