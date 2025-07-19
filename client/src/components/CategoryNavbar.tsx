import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, 
  Home, 
  Sparkles, 
  Building2, 
  Car, 
  Sofa, 
  Shirt, 
  Droplets,
  ArrowRight,
  Scissors,
  Zap,
  Wrench
} from 'lucide-react';

// Category icons mapping with better, more relevant icons
const categoryIcons: { [key: string]: any } = {
  'House Cleaning': Home,
  'Office Cleaning': Building2,
  'Car Cleaning': Car,
  'Carpet Cleaning': Sofa,
  'Laundry Services': Shirt,
  'Deep Cleaning': Zap,
  'Window Cleaning': Sparkles,
  'Test Category': Wrench,
};

export default function CategoryNavbar() {
  const [location] = useLocation();
  
  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/categories/active'],
  });

  // Don't show category navbar on auth pages
  if (location.startsWith('/login') || location.startsWith('/register') || location.startsWith('/forgot-password')) {
    return null;
  }

  // Get current category from URL
  const getCurrentCategory = () => {
    const pathParts = location.split('/');
    if (pathParts.length === 3 && pathParts[1] === 'services' && pathParts[2]) {
      const categorySlug = pathParts[2];
      return categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return null;
  };

  const currentCategory = getCurrentCategory();
  const isAllServicesActive = location === '/services';

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {/* Category Grid */}
          <div className="flex items-center justify-center space-x-8 overflow-x-auto lg:overflow-x-visible">
            {isLoading ? (
              <div className="flex space-x-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center space-y-2 animate-pulse"
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-full" />
                    <div className="w-20 h-4 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* All Services */}
                <Link href="/services">
                  <div className="flex flex-col items-center space-y-2 cursor-pointer group min-w-[80px]">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                      isAllServicesActive 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                    }`}>
                      <Sparkles className="h-8 w-8" />
                    </div>
                    <span className={`text-sm font-medium text-center transition-colors ${
                      isAllServicesActive 
                        ? 'text-blue-600' 
                        : 'text-gray-700 group-hover:text-blue-600'
                    }`}>All Services</span>
                  </div>
                </Link>
                
                {/* Category Items */}
                {/* Show first 7 categories on mobile, all on desktop */}
                {categories?.map((category: any, index: number) => {
                  const IconComponent = categoryIcons[category.name] || Sparkles;
                  const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-');
                  const isActive = currentCategory === category.name;
                  
                  return (
                    <Link key={category.id} href={`/services/${categorySlug}`}>
                      <div className={`flex flex-col items-center space-y-2 cursor-pointer group min-w-[80px] ${index >= 7 ? 'hidden lg:flex' : ''}`}>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                          isActive 
                            ? 'bg-red-600 text-white' 
                            : 'bg-gray-100 text-gray-600 group-hover:bg-red-100 group-hover:text-red-600'
                        }`}>
                          <IconComponent className="h-8 w-8" />
                        </div>
                        <span className={`text-sm font-medium text-center max-w-[80px] leading-tight transition-colors ${
                          isActive 
                            ? 'text-red-600 font-semibold' 
                            : 'text-gray-700 group-hover:text-red-600'
                        }`}>
                          {category.name}
                        </span>
                      </div>
                    </Link>
                  );
                })}
                
                {/* View More - only show on mobile */}
                <div className="lg:hidden">
                  <Link href="/services">
                    <div className="flex flex-col items-center space-y-2 cursor-pointer group min-w-[80px]">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <ArrowRight className="h-8 w-8 text-gray-600 group-hover:text-gray-800" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-800 text-center">View More</span>
                    </div>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}