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
  ArrowRight
} from 'lucide-react';

// Category icons mapping
const categoryIcons: { [key: string]: any } = {
  'House Cleaning': Home,
  'Office Cleaning': Building2,
  'Car Cleaning': Car,
  'Carpet Cleaning': Sofa,
  'Laundry Services': Shirt,
  'Deep Cleaning': Droplets,
  'Window Cleaning': Sparkles,
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

  return (
    <div className="bg-gradient-to-r from-blue-50 to-red-50 border-b border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2 h-auto hover:bg-blue-100">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="capitalize font-medium">
              {location === '/' ? '' : 
               location === '/services' ? 'Services' : 
               location === '/about' ? 'About' : 
               location === '/contact' ? 'Contact' : 
               location.split('/').pop()?.replace('-', ' ')}
            </span>
          </div>

          {/* Category Pills with Icons */}
          <div className="flex items-center space-x-3 overflow-x-auto">
            {isLoading ? (
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-24 bg-blue-200 rounded-full animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/services">
                  <Badge 
                    variant={location === '/services' ? 'default' : 'secondary'}
                    className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-blue-600 hover:text-white cursor-pointer transition-all duration-200 shadow-md border border-blue-600/20 text-blue-600 hover:border-blue-600 text-sm font-medium"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>All Services</span>
                  </Badge>
                </Link>
                {categories?.slice(0, 6).map((category: any) => {
                  const IconComponent = categoryIcons[category.name] || Sparkles;
                  return (
                    <Link key={category.id} href={`/services?category=${category.id}`}>
                      <Badge 
                        variant="secondary"
                        className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-red-500 hover:text-white cursor-pointer transition-all duration-200 shadow-md border border-red-500/20 text-red-500 hover:border-red-500 text-sm font-medium"
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{category.name}</span>
                      </Badge>
                    </Link>
                  );
                })}
                
                {/* View All Categories */}
                <Link href="/services">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center space-x-2 text-primary hover:text-accent hover:bg-primary/10 px-4 py-2 text-sm font-medium"
                  >
                    <span>View All</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}