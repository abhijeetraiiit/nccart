import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

/**
 * Partner earnings configuration
 */
const EARNINGS_CONFIG = {
  COMMISSION_RATE: 0.05, // 5% commission
  MAX_EARNING_CAP: 100,  // ₹100 maximum per delivery
};

/**
 * Calculate estimated partner earnings
 */
function calculateEstimatedEarnings(orderTotal: number): number {
  return Math.min(
    orderTotal * EARNINGS_CONFIG.COMMISSION_RATE,
    EARNINGS_CONFIG.MAX_EARNING_CAP
  );
}

/**
 * Partner Registration Controller
 * Handles delivery partner onboarding with KYC
 */
export const registerPartner = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      phone,
      email,
      partnerType,
      aadhaarNumber,
      aadhaarDocument,
    } = req.body;

    // Check if partner already exists
    const existingPartner = await prisma.deliveryPartner.findUnique({
      where: { phone },
    });

    if (existingPartner) {
      return res.status(400).json({
        success: false,
        message: 'Partner with this phone number already exists',
      });
    }

    // Create partner (KYC verification would happen async)
    const partner = await prisma.deliveryPartner.create({
      data: {
        name,
        phone,
        email,
        partnerType: partnerType || 'WALKER',
        aadhaarNumber,
        aadhaarDocument,
        kycStatus: aadhaarNumber ? 'PENDING' : 'NOT_VERIFIED',
        status: 'INACTIVE', // Activate after KYC approval
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Partner registered successfully. KYC verification pending.',
      data: {
        id: partner.id,
        name: partner.name,
        phone: partner.phone,
        partnerType: partner.partnerType,
        kycStatus: partner.kycStatus,
      },
    });
  } catch (error: any) {
    console.error('Error registering partner:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Update Partner Location
 * Real-time location tracking for dispatch algorithm
 */
export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const partner = await prisma.deliveryPartner.update({
      where: { id },
      data: {
        currentLatitude: latitude,
        currentLongitude: longitude,
        lastLocationUpdate: new Date(),
      },
    });

    return res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        latitude: partner.currentLatitude,
        longitude: partner.currentLongitude,
        updatedAt: partner.lastLocationUpdate,
      },
    });
  } catch (error: any) {
    console.error('Error updating location:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Toggle Partner Availability
 * Partners can go online/offline
 */
export const toggleAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const partner = await prisma.deliveryPartner.update({
      where: { id },
      data: {
        isAvailable: isAvailable === true || isAvailable === 'true',
      },
    });

    return res.json({
      success: true,
      message: `Partner is now ${partner.isAvailable ? 'online' : 'offline'}`,
      data: {
        id: partner.id,
        isAvailable: partner.isAvailable,
      },
    });
  } catch (error: any) {
    console.error('Error toggling availability:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get Available Delivery Requests
 * Returns nearby orders needing delivery
 */
export const getAvailableOrders = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get partner location
    const partner = await prisma.deliveryPartner.findUnique({
      where: { id },
      select: {
        currentLatitude: true,
        currentLongitude: true,
        partnerType: true,
        isAvailable: true,
      },
    });

    if (!partner || !partner.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Partner not available or not found',
      });
    }

    if (!partner.currentLatitude || !partner.currentLongitude) {
      return res.status(400).json({
        success: false,
        message: 'Partner location not set',
      });
    }

    // Find nearby pending orders
    // In production: Use PostGIS for efficient geospatial queries
    const orders = await prisma.order.findMany({
      where: {
        status: 'CONFIRMED',
        deliveryPartnerId: null,
        pickupLatitude: { not: null },
        pickupLongitude: { not: null },
      },
      include: {
        shippingAddress: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                weight: true,
              },
            },
          },
        },
      },
      take: 10, // Limit results
    });

    return res.json({
      success: true,
      data: orders.map(order => ({
        orderId: order.id,
        orderNumber: order.orderNumber,
        pickupLocation: {
          latitude: order.pickupLatitude,
          longitude: order.pickupLongitude,
        },
        deliveryLocation: {
          latitude: order.deliveryLatitude,
          longitude: order.deliveryLongitude,
        },
        deliveryAddress: order.shippingAddress,
        estimatedEarnings: calculateEstimatedEarnings(order.total),
        items: order.items.length,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching available orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Accept Delivery Request
 * Partner accepts an order for delivery
 */
export const acceptDelivery = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
      });
    }

    // Check if partner is available
    const partner = await prisma.deliveryPartner.findUnique({
      where: { id },
    });

    if (!partner || !partner.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Partner not available',
      });
    }

    // Check if order is still available
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.deliveryPartnerId) {
      return res.status(400).json({
        success: false,
        message: 'Order already assigned to another partner',
      });
    }

    // Assign order to partner
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryPartnerId: id,
        status: 'PROCESSING',
      },
    });

    return res.json({
      success: true,
      message: 'Delivery accepted successfully',
      data: {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
      },
    });
  } catch (error: any) {
    console.error('Error accepting delivery:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get Partner Dashboard
 * Earnings, stats, and performance metrics
 */
export const getPartnerDashboard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const partner = await prisma.deliveryPartner.findUnique({
      where: { id },
      include: {
        deliveries: {
          where: {
            status: { in: ['DELIVERED', 'SHIPPED', 'PROCESSING'] },
          },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
            deliveredAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found',
      });
    }

    return res.json({
      success: true,
      data: {
        profile: {
          name: partner.name,
          phone: partner.phone,
          partnerType: partner.partnerType,
          rating: partner.rating,
          level: partner.level,
          badges: partner.badges,
        },
        stats: {
          totalDeliveries: partner.totalDeliveries,
          successfulDeliveries: partner.successfulDeliveries,
          totalEarnings: partner.totalEarnings,
          successRate: partner.totalDeliveries > 0
            ? (partner.successfulDeliveries / partner.totalDeliveries) * 100
            : 0,
        },
        recentDeliveries: partner.deliveries,
        availability: {
          isAvailable: partner.isAvailable,
          lastLocationUpdate: partner.lastLocationUpdate,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching partner dashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get Partner Profile
 */
export const getPartnerProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const partner = await prisma.deliveryPartner.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        partnerType: true,
        status: true,
        kycStatus: true,
        rating: true,
        totalDeliveries: true,
        successfulDeliveries: true,
        totalEarnings: true,
        badges: true,
        level: true,
        isAvailable: true,
        createdAt: true,
      },
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found',
      });
    }

    return res.json({
      success: true,
      data: partner,
    });
  } catch (error: any) {
    console.error('Error fetching partner profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
