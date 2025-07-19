import { storage } from './storage.js';
// No need for direct database imports, using storage layer

export interface PromotionCalculation {
  promotionId: number | null;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  appliedPromotion?: {
    id: number;
    title: string;
    description: string;
    discountPercentage?: number;
    discountAmount?: number;
  };
}

/**
 * Finds the best applicable promotion for a booking
 */
export async function findBestPromotion(servicePrice: number, bookingDate: Date): Promise<PromotionCalculation> {
  try {
    // Get all active promotions that are valid for the booking date
    const activePromotions = await storage.getActivePromotions();

    if (activePromotions.length === 0) {
      return {
        promotionId: null,
        originalAmount: servicePrice,
        discountAmount: 0,
        finalAmount: servicePrice
      };
    }

    // Calculate discount for each promotion and find the best one
    let bestPromotion = null;
    let maxDiscount = 0;
    let bestDiscountAmount = 0;

    for (const promotion of activePromotions) {
      let discountAmount = 0;

      if (promotion.discountPercentage) {
        discountAmount = (servicePrice * Number(promotion.discountPercentage)) / 100;
      } else if (promotion.discountAmount) {
        discountAmount = Number(promotion.discountAmount);
      }

      // Ensure discount doesn't exceed service price
      discountAmount = Math.min(discountAmount, servicePrice);

      if (discountAmount > maxDiscount) {
        maxDiscount = discountAmount;
        bestDiscountAmount = discountAmount;
        bestPromotion = promotion;
      }
    }

    if (bestPromotion) {
      return {
        promotionId: bestPromotion.id,
        originalAmount: servicePrice,
        discountAmount: bestDiscountAmount,
        finalAmount: servicePrice - bestDiscountAmount,
        appliedPromotion: {
          id: bestPromotion.id,
          title: bestPromotion.title,
          description: bestPromotion.description || '',
          discountPercentage: bestPromotion.discountPercentage ? Number(bestPromotion.discountPercentage) : undefined,
          discountAmount: bestPromotion.discountAmount ? Number(bestPromotion.discountAmount) : undefined
        }
      };
    }

    return {
      promotionId: null,
      originalAmount: servicePrice,
      discountAmount: 0,
      finalAmount: servicePrice
    };
  } catch (error) {
    console.error('Error finding best promotion:', error);
    return {
      promotionId: null,
      originalAmount: servicePrice,
      discountAmount: 0,
      finalAmount: servicePrice
    };
  }
}

/**
 * Automatically deactivates expired promotions
 */
export async function deactivateExpiredPromotions(): Promise<number> {
  try {
    const now = new Date();
    const allPromotions = await storage.getAllPromotions();
    
    let deactivatedCount = 0;
    for (const promotion of allPromotions) {
      if (promotion.isActive && new Date(promotion.endDate) < now) {
        await storage.updatePromotion(promotion.id, { isActive: false });
        deactivatedCount++;
      }
    }

    if (deactivatedCount > 0) {
      console.log(`Deactivated ${deactivatedCount} expired promotions`);
    }
    return deactivatedCount;
  } catch (error) {
    console.error('Error deactivating expired promotions:', error);
    return 0;
  }
}

/**
 * Checks and updates bookings that might have invalid promotions due to expired dates
 */
export async function cleanupInvalidBookingPromotions(): Promise<number> {
  try {
    // Get all bookings and check for invalid promotions
    const allBookings = await storage.getAllBookings();
    const allPromotions = await storage.getAllPromotions();
    
    const promotionMap = new Map(allPromotions.map(p => [p.id, p]));
    let cleanedCount = 0;

    for (const booking of allBookings) {
      if (booking.promotionId) {
        const promotion = promotionMap.get(booking.promotionId);
        
        // If promotion doesn't exist or is inactive, clean up the booking
        if (!promotion || !promotion.isActive) {
          await storage.updateBooking(booking.id, {
            promotionId: null,
            discountAmount: "0.00",
            totalAmount: booking.originalAmount || booking.totalAmount
          });
          cleanedCount++;
        }
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} bookings with invalid promotions`);
    }
    return cleanedCount;
  } catch (error) {
    console.error('Error cleaning up invalid booking promotions:', error);
    return 0;
  }
}

/**
 * Runs automatic promotion maintenance (should be called periodically)
 */
export async function runPromotionMaintenance(): Promise<{
  expiredPromotions: number;
  cleanedBookings: number;
}> {
  console.log('Running promotion maintenance...');
  
  const expiredPromotions = await deactivateExpiredPromotions();
  const cleanedBookings = await cleanupInvalidBookingPromotions();
  
  return {
    expiredPromotions,
    cleanedBookings
  };
}