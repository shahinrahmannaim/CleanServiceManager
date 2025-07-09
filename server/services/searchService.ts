import { storage } from '../storage';
import { Service } from '@shared/schema';

export class SearchService {
  async searchServices(query: string, filters?: {
    category?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Service[]> {
    try {
      // Basic database search implementation
      let services = await storage.searchServices(query);
      
      // Apply filters if provided
      if (filters) {
        if (filters.category) {
          const categoryId = parseInt(filters.category);
          services = services.filter(service => service.categoryId === categoryId);
        }
        
        if (filters.minPrice) {
          services = services.filter(service => parseFloat(service.price) >= filters.minPrice!);
        }
        
        if (filters.maxPrice) {
          services = services.filter(service => parseFloat(service.price) <= filters.maxPrice!);
        }
      }
      
      return services;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }
  
  async getPopularServices(): Promise<Service[]> {
    try {
      // Return all services for now, in a real implementation this would be based on booking count
      return await storage.getAllServices();
    } catch (error) {
      console.error('Error getting popular services:', error);
      return [];
    }
  }
  
  async getServicesByLocation(city: string): Promise<Service[]> {
    try {
      // Simple location-based search
      return await storage.getAllServices();
    } catch (error) {
      console.error('Error getting services by location:', error);
      return [];
    }
  }
}

export const searchService = new SearchService();