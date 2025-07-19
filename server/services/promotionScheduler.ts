import { runPromotionMaintenance } from '../promotionService.js';

class PromotionScheduler {
  private intervalId: NodeJS.Timer | null = null;
  private readonly MAINTENANCE_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

  /**
   * Start the promotion maintenance scheduler
   */
  start(): void {
    if (this.intervalId) {
      console.log('Promotion scheduler already running');
      return;
    }

    console.log('Starting promotion maintenance scheduler (runs every hour)');
    
    // Run immediately on start
    this.runMaintenance();
    
    // Schedule to run every hour
    this.intervalId = setInterval(() => {
      this.runMaintenance();
    }, this.MAINTENANCE_INTERVAL);
  }

  /**
   * Stop the promotion maintenance scheduler
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Promotion scheduler stopped');
    }
  }

  /**
   * Run promotion maintenance manually
   */
  private async runMaintenance(): Promise<void> {
    try {
      console.log('Running scheduled promotion maintenance...');
      const result = await runPromotionMaintenance();
      
      if (result.expiredPromotions > 0 || result.cleanedBookings > 0) {
        console.log(`Promotion maintenance completed: ${result.expiredPromotions} expired promotions, ${result.cleanedBookings} cleaned bookings`);
      }
    } catch (error) {
      console.error('Error during scheduled promotion maintenance:', error);
    }
  }
}

export const promotionScheduler = new PromotionScheduler();