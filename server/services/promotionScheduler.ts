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
   * Run promotion maintenance manually with retry logic for serverless DB
   */
  private async runMaintenance(): Promise<void> {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Running scheduled promotion maintenance (attempt ${attempt}/${maxRetries})...`);
        const result = await runPromotionMaintenance();
        
        if (result.expiredPromotions > 0 || result.cleanedBookings > 0) {
          console.log(`Promotion maintenance completed: ${result.expiredPromotions} expired promotions, ${result.cleanedBookings} cleaned bookings`);
        } else {
          console.log('Promotion maintenance completed: no changes needed');
        }
        
        // Success - exit retry loop
        return;
        
      } catch (error) {
        lastError = error;
        const err = error as Error;
        
        // Check if this is a database connection issue that might resolve with retry
        if (err.message.includes('timeout') || 
            err.message.includes('WebSocket') || 
            err.message.includes('terminated') ||
            err.message.includes('Connection') ||
            err.message.includes('ECONNRESET')) {
          
          console.warn(`Promotion maintenance attempt ${attempt}/${maxRetries} failed: ${err.message}`);
          
          if (attempt < maxRetries) {
            // Wait with exponential backoff before retry
            const delay = 2000 * Math.pow(2, attempt - 1); // 2s, 4s, 8s
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        // For non-connection errors or final attempt, log and exit
        console.error(`Promotion maintenance failed (final attempt): ${err.message}`);
        break;
      }
    }
    
    // Don't crash the app - just log the failure
    console.error('Promotion maintenance failed after all retries, will try again next cycle');
  }
}

export const promotionScheduler = new PromotionScheduler();