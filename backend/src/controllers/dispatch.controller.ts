import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { smartDispatchEngine } from '../services/smart-dispatch.service';

/**
 * Dispatch Controller
 * Handles smart dispatch operations
 */

/**
 * Assign Delivery Partner
 * Triggers the smart dispatch algorithm
 */
export const assignDeliveryPartner = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      orderId,
      vendorLocation,
      customerLocation,
    } = req.body;

    if (!vendorLocation || !customerLocation) {
      return res.status(400).json({
        success: false,
        message: 'Vendor and customer locations are required',
      });
    }

    if (!vendorLocation.latitude || !vendorLocation.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vendor location coordinates',
      });
    }

    if (!customerLocation.latitude || !customerLocation.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer location coordinates',
      });
    }

    // Execute smart dispatch
    const result = await smartDispatchEngine.smartDispatch(
      orderId,
      {
        latitude: parseFloat(vendorLocation.latitude),
        longitude: parseFloat(vendorLocation.longitude),
      },
      {
        latitude: parseFloat(customerLocation.latitude),
        longitude: parseFloat(customerLocation.longitude),
      }
    );

    if (result.success) {
      return res.json({
        success: true,
        message: result.message,
        data: {
          orderId,
          stage: result.stage,
          partnerId: result.partnerId,
          partnerName: result.partnerName,
          estimatedDelivery: result.estimatedDelivery,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
        data: {
          orderId,
          stage: result.stage,
        },
      });
    }
  } catch (error: any) {
    console.error('Error in dispatch assignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get Dispatch Status
 * Returns dispatch logs and current status for an order
 */
export const getDispatchStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const analytics = await smartDispatchEngine.getDispatchAnalytics(orderId);

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'No dispatch logs found for this order',
      });
    }

    return res.json({
      success: true,
      data: {
        orderId,
        totalAttempts: analytics.totalAttempts,
        stages: analytics.stages,
        accepted: analytics.accepted,
        finalStage: analytics.finalStage,
        logs: analytics.logs.map(log => ({
          stage: log.stage,
          partnerId: log.partnerId,
          partnerName: log.partner?.name,
          partnerType: log.partner?.partnerType,
          distanceKm: log.distanceKm,
          pingedAt: log.pingedAt,
          respondedAt: log.respondedAt,
          accepted: log.accepted,
          responseTimeSeconds: log.responseTimeSeconds,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching dispatch status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get Nearby Partners
 * Utility endpoint to check available partners in an area
 */
export const getNearbyPartners = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius, type } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const radiusKm = radius ? parseFloat(radius as string) : 5;
    const partnerTypes = type ? [type as string] : ['WALKER', 'BIKE', 'EV'];

    const partners = await smartDispatchEngine.findNearbyPartners(
      {
        latitude: parseFloat(latitude as string),
        longitude: parseFloat(longitude as string),
      },
      radiusKm,
      partnerTypes
    );

    return res.json({
      success: true,
      data: {
        count: partners.length,
        radius: radiusKm,
        partners: partners.filter(p => p !== null).map(p => ({
          id: p!.id,
          name: p!.name,
          partnerType: p!.partnerType,
          distance: p!.distance,
          rating: p!.rating,
          totalDeliveries: p!.totalDeliveries,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching nearby partners:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
