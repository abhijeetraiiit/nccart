import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Location coordinates
 */
interface Location {
  latitude: number;
  longitude: number;
}

/**
 * Dispatch result
 */
interface DispatchResult {
  success: boolean;
  stage: 'MESH' | 'GIG' | 'COURIER';
  partnerId?: string;
  partnerName?: string;
  estimatedDelivery?: Date;
  message: string;
}

/**
 * Smart Dispatch Engine (SDE)
 * Implements cascading priority model for delivery assignment
 * 
 * Stage 1: Neighborhood Mesh (Walkers within 1.5km, 180s timeout)
 * Stage 2: Gig-Pool Escalation (Bike/EV within 10km, 15min timeout)
 * Stage 3: Enterprise Bridge (National courier partners)
 */
export class SmartDispatchEngine {
  /**
   * Calculate distance between two coordinates using Haversine formula
   * 
   * @param loc1 - First location
   * @param loc2 - Second location
   * @returns Distance in kilometers
   */
  private calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(loc2.latitude - loc1.latitude);
    const dLon = this.toRad(loc2.longitude - loc1.longitude);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(loc1.latitude)) *
      Math.cos(this.toRad(loc2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find nearby delivery partners within radius
   * 
   * @param vendorLocation - Vendor/pickup location
   * @param radiusKm - Search radius in kilometers
   * @param partnerTypes - Types of partners to search for
   * @returns Array of available partners with distances
   */
  public async findNearbyPartners(
    vendorLocation: Location,
    radiusKm: number,
    partnerTypes: string[]
  ) {
    try {
      // Get all available partners of specified types
      const partners = await prisma.deliveryPartner.findMany({
        where: {
          isAvailable: true,
          partnerType: { in: partnerTypes as any },
          status: 'ACTIVE',
          currentLatitude: { not: null },
          currentLongitude: { not: null },
        },
      });

      // Filter by distance and calculate distances
      const nearbyPartners = partners
        .map(partner => {
          if (!partner.currentLatitude || !partner.currentLongitude) {
            return null;
          }

          const distance = this.calculateDistance(
            vendorLocation,
            {
              latitude: partner.currentLatitude,
              longitude: partner.currentLongitude,
            }
          );

          return {
            ...partner,
            distance,
          };
        })
        .filter(p => p !== null && p.distance <= radiusKm)
        .sort((a, b) => (a?.distance || 0) - (b?.distance || 0));

      return nearbyPartners;
    } catch (error) {
      console.error('Error finding nearby partners:', error);
      return [];
    }
  }

  /**
   * Rank partners by commute path optimization
   * Considers both distance to pickup and distance to delivery
   * 
   * @param partners - Available partners
   * @param customerLocation - Delivery location
   * @returns Best ranked partner
   */
  public rankByCommutePath(partners: any[], customerLocation: Location) {
    if (partners.length === 0) return null;

    // Score based on:
    // 1. Total commute distance (pickup + delivery)
    // 2. Partner rating
    // 3. Success rate
    const scored = partners.map(partner => {
      const pickupDistance = partner.distance; // Already calculated
      
      const deliveryDistance = this.calculateDistance(
        {
          latitude: partner.currentLatitude,
          longitude: partner.currentLongitude,
        },
        customerLocation
      );

      const totalDistance = pickupDistance + deliveryDistance;
      
      // Calculate score (lower is better for distance, higher for rating)
      const distanceScore = 1 / (totalDistance + 1); // Inverse distance
      const ratingScore = partner.rating / 5; // Normalize to 0-1
      const successScore = partner.successfulDeliveries / (partner.totalDeliveries || 1);
      
      const finalScore = (distanceScore * 0.5) + (ratingScore * 0.3) + (successScore * 0.2);
      
      return {
        partner,
        score: finalScore,
        totalDistance,
      };
    });

    // Sort by score (descending)
    scored.sort((a, b) => b.score - a.score);
    
    return scored[0]?.partner || null;
  }

  /**
   * Log dispatch attempt
   * 
   * @param orderId - Order ID
   * @param partnerId - Partner ID
   * @param stage - Dispatch stage
   * @param vendorLocation - Vendor location
   * @param customerLocation - Customer location
   * @param accepted - Whether partner accepted
   */
  private async logDispatch(
    orderId: string,
    partnerId: string | null,
    stage: 'MESH' | 'GIG' | 'COURIER',
    vendorLocation: Location,
    customerLocation: Location,
    accepted: boolean = false
  ) {
    try {
      const distance = this.calculateDistance(vendorLocation, customerLocation);
      
      await prisma.dispatchLog.create({
        data: {
          orderId,
          partnerId,
          stage,
          accepted,
          vendorLatitude: vendorLocation.latitude,
          vendorLongitude: vendorLocation.longitude,
          customerLatitude: customerLocation.latitude,
          customerLongitude: customerLocation.longitude,
          distanceKm: distance,
          pingedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error logging dispatch:', error);
    }
  }

  /**
   * Stage 1: Neighborhood Mesh
   * Ping walkers within 1.5km radius
   * 
   * @param orderId - Order ID
   * @param vendorLocation - Vendor location
   * @param customerLocation - Customer location
   * @returns Dispatch result
   */
  public async stage1NeighborhoodMesh(
    orderId: string,
    vendorLocation: Location,
    customerLocation: Location
  ): Promise<DispatchResult> {
    console.log(`[Stage 1: Mesh] Searching for walkers within 1.5km...`);

    const activeWalkers = await this.findNearbyPartners(
      vendorLocation,
      1.5,
      ['WALKER']
    );

    if (activeWalkers.length === 0) {
      console.log(`[Stage 1: Mesh] No walkers available. Escalating...`);
      return {
        success: false,
        stage: 'MESH',
        message: 'No walkers available within 1.5km',
      };
    }

    console.log(`[Stage 1: Mesh] Found ${activeWalkers.length} walker(s)`);

    // Get best walker based on commute path
    const bestWalker = this.rankByCommutePath(activeWalkers, customerLocation);

    if (!bestWalker) {
      return {
        success: false,
        stage: 'MESH',
        message: 'No suitable walker found',
      };
    }

    // Log the dispatch attempt
    await this.logDispatch(
      orderId,
      bestWalker.id,
      'MESH',
      vendorLocation,
      customerLocation,
      true // In real implementation, wait for acceptance
    );

    // In production: Send real-time notification via MQTT/WebSocket
    // await this.sendNotification(bestWalker.id, orderId, 180); // 180s timeout
    
    console.log(`[Stage 1: Mesh] Assigned to walker: ${bestWalker.name}`);

    return {
      success: true,
      stage: 'MESH',
      partnerId: bestWalker.id,
      partnerName: bestWalker.name,
      estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes
      message: `Assigned to nearby walker: ${bestWalker.name}`,
    };
  }

  /**
   * Stage 2: Gig-Pool Escalation
   * Ping bike/EV riders within 10km radius
   * 
   * @param orderId - Order ID
   * @param vendorLocation - Vendor location
   * @param customerLocation - Customer location
   * @returns Dispatch result
   */
  public async stage2GigPool(
    orderId: string,
    vendorLocation: Location,
    customerLocation: Location
  ): Promise<DispatchResult> {
    console.log(`[Stage 2: Gig Pool] Searching for bike/EV riders within 10km...`);

    const gigWorkers = await this.findNearbyPartners(
      vendorLocation,
      10,
      ['BIKE', 'EV']
    );

    if (gigWorkers.length === 0) {
      console.log(`[Stage 2: Gig Pool] No gig workers available. Escalating...`);
      return {
        success: false,
        stage: 'GIG',
        message: 'No gig workers available within 10km',
      };
    }

    console.log(`[Stage 2: Gig Pool] Found ${gigWorkers.length} gig worker(s)`);

    const bestWorker = this.rankByCommutePath(gigWorkers, customerLocation);

    if (!bestWorker) {
      return {
        success: false,
        stage: 'GIG',
        message: 'No suitable gig worker found',
      };
    }

    // Log the dispatch attempt
    await this.logDispatch(
      orderId,
      bestWorker.id,
      'GIG',
      vendorLocation,
      customerLocation,
      true
    );

    console.log(`[Stage 2: Gig Pool] Assigned to gig worker: ${bestWorker.name}`);

    return {
      success: true,
      stage: 'GIG',
      partnerId: bestWorker.id,
      partnerName: bestWorker.name,
      estimatedDelivery: new Date(Date.now() + 90 * 60 * 1000), // 90 minutes
      message: `Assigned to gig worker: ${bestWorker.name}`,
    };
  }

  /**
   * Stage 3: Enterprise Bridge
   * Assign to national courier partner
   * 
   * @param orderId - Order ID
   * @param vendorLocation - Vendor location
   * @param customerLocation - Customer location
   * @returns Dispatch result
   */
  public async stage3Courier(
    orderId: string,
    vendorLocation: Location,
    customerLocation: Location
  ): Promise<DispatchResult> {
    console.log(`[Stage 3: Courier] Assigning to national courier...`);

    // Get active courier partners
    const courierPartners = await prisma.courierPartner.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { successRate: 'desc' },
    });

    if (courierPartners.length === 0) {
      console.error(`[Stage 3: Courier] No courier partners configured!`);
      return {
        success: false,
        stage: 'COURIER',
        message: 'No courier partners available',
      };
    }

    // Select best courier based on success rate
    const bestCourier = courierPartners[0];

    // Log the dispatch attempt
    await this.logDispatch(
      orderId,
      null, // No individual partner for couriers
      'COURIER',
      vendorLocation,
      customerLocation,
      true
    );

    console.log(`[Stage 3: Courier] Assigned to: ${bestCourier.displayName}`);

    // In production: Call courier API to generate shipping label
    // const trackingNumber = await this.generateShippingLabel(orderId, bestCourier);

    return {
      success: true,
      stage: 'COURIER',
      partnerId: bestCourier.id,
      partnerName: bestCourier.displayName,
      estimatedDelivery: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
      message: `Assigned to ${bestCourier.displayName}`,
    };
  }

  /**
   * Main Smart Dispatch Function
   * Cascades through all 3 stages until delivery partner is assigned
   * 
   * @param orderId - Order ID
   * @param vendorLocation - Vendor/pickup location
   * @param customerLocation - Customer/delivery location
   * @returns Final dispatch result
   */
  public async smartDispatch(
    orderId: string,
    vendorLocation: Location,
    customerLocation: Location
  ): Promise<DispatchResult> {
    console.log(`\n========================================`);
    console.log(`Smart Dispatch initiated for Order: ${orderId}`);
    console.log(`Vendor: [${vendorLocation.latitude}, ${vendorLocation.longitude}]`);
    console.log(`Customer: [${customerLocation.latitude}, ${customerLocation.longitude}]`);
    console.log(`========================================\n`);

    // Stage 1: Try neighborhood walkers
    let result = await this.stage1NeighborhoodMesh(
      orderId,
      vendorLocation,
      customerLocation
    );

    if (result.success) {
      console.log(`✓ Dispatch successful at Stage 1 (Mesh)\n`);
      return result;
    }

    // Stage 2: Try gig pool
    result = await this.stage2GigPool(
      orderId,
      vendorLocation,
      customerLocation
    );

    if (result.success) {
      console.log(`✓ Dispatch successful at Stage 2 (Gig Pool)\n`);
      return result;
    }

    // Stage 3: Use national courier
    result = await this.stage3Courier(
      orderId,
      vendorLocation,
      customerLocation
    );

    if (result.success) {
      console.log(`✓ Dispatch successful at Stage 3 (Courier)\n`);
      return result;
    }

    // All stages failed
    console.error(`✗ Dispatch failed at all stages!\n`);
    return {
      success: false,
      stage: 'COURIER',
      message: 'Unable to assign delivery partner',
    };
  }

  /**
   * Get dispatch analytics for an order
   * 
   * @param orderId - Order ID
   * @returns Dispatch logs and analytics
   */
  public async getDispatchAnalytics(orderId: string) {
    try {
      const logs = await prisma.dispatchLog.findMany({
        where: { orderId },
        include: {
          partner: {
            select: {
              name: true,
              partnerType: true,
              rating: true,
            },
          },
        },
        orderBy: { pingedAt: 'asc' },
      });

      return {
        totalAttempts: logs.length,
        stages: logs.map(l => l.stage),
        accepted: logs.some(l => l.accepted),
        finalStage: logs[logs.length - 1]?.stage || null,
        logs,
      };
    } catch (error) {
      console.error('Error fetching dispatch analytics:', error);
      return null;
    }
  }
}

export const smartDispatchEngine = new SmartDispatchEngine();
