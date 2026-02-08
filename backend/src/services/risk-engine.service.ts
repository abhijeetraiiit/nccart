import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Buyer Profile for Trust Score Calculation
 */
interface BuyerProfile {
  totalOrders: number;
  returnedOrders: number;
  cancelledOrders: number;
  pincodeRisk: number; // 0 (Safe) to 1 (High Fraud Area)
  accountAgeDays: number;
}

/**
 * Risk Engine Service
 * Implements enterprise risk engine to prevent RTO (Return to Origin) losses
 */
export class RiskEngine {
  /**
   * Calculate Buyer Trust Score (BTS)
   * 
   * Scoring Factors:
   * - Order Completion Rate (60% weight): Ratio of delivered vs. returned orders
   * - Location Risk (30% weight): Historical RTO data for specific pin codes
   * - Account Maturity (10% weight): Account age in days
   * - Cancellation Penalty: Deduct 0.05 per cancelled order
   * 
   * @param profile - Buyer profile data
   * @returns Trust score between 0 and 1
   */
  public calculateTrustScore(profile: BuyerProfile): number {
    // Order completion rate (60% weight)
    const deliverySuccess = profile.totalOrders > 0
      ? (profile.totalOrders - profile.returnedOrders) / profile.totalOrders
      : 0.5; // Default for new users
    
    // Cancellation penalty
    const cancellationPenalty = profile.cancelledOrders * 0.05;
    
    // Account maturity (10% weight) - normalized to 1 year
    const accountMaturity = Math.min(profile.accountAgeDays / 365, 1);
    
    // Calculate weighted score
    let score = 
      (deliverySuccess * 0.6) -
      (profile.pincodeRisk * 0.3) +
      (accountMaturity * 0.1) -
      cancellationPenalty;
    
    // Clamp between 0 and 1
    return Math.max(0, Math.min(score, 1));
  }

  /**
   * Get available payment methods based on trust score
   * 
   * Logic:
   * - Score > 0.8: Platinum User - All methods including BNPL
   * - Score > 0.5: Standard User - All methods, COD with ₹29 deposit
   * - Score <= 0.5: High Risk - Prepaid only (UPI, CARD)
   * 
   * @param score - Trust score (0-1)
   * @returns Array of available payment methods
   */
  public getPaymentMethods(score: number): string[] {
    if (score > 0.8) {
      // Platinum User: All payment methods
      return ['UPI', 'CARD', 'COD', 'BNPL', 'NETBANKING', 'WALLET'];
    }
    
    if (score > 0.5) {
      // Standard User: COD with commitment fee
      return ['UPI', 'CARD', 'COD_WITH_DEPOSIT', 'NETBANKING', 'WALLET'];
    }
    
    // High Risk: Prepaid only
    return ['UPI', 'CARD', 'NETBANKING', 'WALLET'];
  }

  /**
   * Calculate commitment fee for COD orders
   * 
   * @param score - Trust score
   * @param orderTotal - Total order amount
   * @returns Commitment fee amount
   */
  public getCommitmentFee(score: number, orderTotal: number): number {
    if (score > 0.8) {
      // Platinum users: No commitment fee
      return 0;
    }
    
    if (score > 0.5) {
      // Standard users: ₹29 commitment fee
      return 29;
    }
    
    // High risk: COD not available
    return 0;
  }

  /**
   * Get pincode risk score from database
   * 
   * @param pincode - 6-digit pincode
   * @returns Risk score (0-1)
   */
  public async getPincodeRisk(pincode: string): Promise<number> {
    try {
      const pincodeData = await prisma.pincodeRisk.findUnique({
        where: { pincode },
      });

      if (!pincodeData) {
        // Default risk for unknown pincodes
        return 0.5;
      }

      return pincodeData.riskScore;
    } catch (error) {
      console.error('Error fetching pincode risk:', error);
      return 0.5; // Default on error
    }
  }

  /**
   * Update pincode risk based on order outcomes
   * 
   * @param pincode - 6-digit pincode
   * @param wasReturned - Whether order was returned
   * @param wasCancelled - Whether order was cancelled
   */
  public async updatePincodeRisk(
    pincode: string,
    wasReturned: boolean = false,
    wasCancelled: boolean = false
  ): Promise<void> {
    try {
      const existing = await prisma.pincodeRisk.findUnique({
        where: { pincode },
      });

      if (existing) {
        // Update existing record
        const newTotalOrders = existing.totalOrders + 1;
        const newReturnedOrders = existing.returnedOrders + (wasReturned ? 1 : 0);
        const newCancelledOrders = existing.cancelledOrders + (wasCancelled ? 1 : 0);
        
        // Recalculate risk score
        const returnRate = newReturnedOrders / newTotalOrders;
        const cancelRate = newCancelledOrders / newTotalOrders;
        const riskScore = (returnRate * 0.6) + (cancelRate * 0.4);

        await prisma.pincodeRisk.update({
          where: { pincode },
          data: {
            totalOrders: newTotalOrders,
            returnedOrders: newReturnedOrders,
            cancelledOrders: newCancelledOrders,
            riskScore: Math.min(riskScore, 1),
            lastUpdated: new Date(),
          },
        });
      } else {
        // Create new record
        await prisma.pincodeRisk.create({
          data: {
            pincode,
            totalOrders: 1,
            returnedOrders: wasReturned ? 1 : 0,
            cancelledOrders: wasCancelled ? 1 : 0,
            riskScore: wasReturned || wasCancelled ? 0.5 : 0.2,
          },
        });
      }
    } catch (error) {
      console.error('Error updating pincode risk:', error);
    }
  }

  /**
   * Calculate and update buyer trust score
   * 
   * @param userId - User ID
   * @param pincode - Delivery pincode
   * @returns Updated trust score
   */
  public async calculateAndUpdateBuyerScore(
    userId: string,
    pincode: string
  ): Promise<number> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { userId },
        include: {
          user: true,
        },
      });

      if (!customer) {
        return 0.5; // Default for non-existent customer
      }

      // Get pincode risk
      const pincodeRisk = await this.getPincodeRisk(pincode);

      // Calculate account age in days
      const accountAgeDays = Math.floor(
        (Date.now() - customer.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Build profile
      const profile: BuyerProfile = {
        totalOrders: customer.totalOrders,
        returnedOrders: customer.returnedOrders,
        cancelledOrders: customer.cancelledOrders,
        pincodeRisk,
        accountAgeDays,
      };

      // Calculate trust score
      const trustScore = this.calculateTrustScore(profile);

      // Update in database
      await prisma.customer.update({
        where: { userId },
        data: {
          trustScore,
          lastScoreUpdate: new Date(),
        },
      });

      return trustScore;
    } catch (error) {
      console.error('Error calculating buyer trust score:', error);
      return 0.5; // Default on error
    }
  }

  /**
   * Check if order should be flagged for review (bot detection)
   * 
   * @param userId - User ID
   * @param checkoutTimeSeconds - Time taken to checkout
   * @returns Whether order should be flagged
   */
  public detectSuspiciousCheckout(
    userId: string,
    checkoutTimeSeconds: number
  ): boolean {
    // Flag if checkout was too fast (< 30 seconds)
    if (checkoutTimeSeconds < 30) {
      return true;
    }

    // Additional checks can be added here
    // - Multiple orders in short time
    // - Unusual purchase patterns
    // - etc.

    return false;
  }
}

export const riskEngine = new RiskEngine();
