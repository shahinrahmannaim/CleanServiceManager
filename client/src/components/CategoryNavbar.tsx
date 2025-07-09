import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Home } from 'lucide-react';

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
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-1 h-auto">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="capitalize">
              {location === '/' ? 'Home' : 
               location === '/services' ? 'Services' : 
               location === '/about' ? 'About' : 
               location === '/contact' ? 'Contact' : 
               location.split('/').pop()?.replace('-', ' ')}
            </span>
          </div>

          {/* Category Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto">
            {isLoading ? (
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link href="/services">
                  <Badge 
                    variant={location === '/services' ? 'default' : 'secondary'}
                    className="hover:bg-primary hover:text-white cursor-pointer transition-colors"
                  >
                    All Services
                  </Badge>
                </Link>
                {categories?.slice(0, 5).map((category: any) => (
                  <Link key={category.id} href={`/services?category=${category.id}`}>
                    <Badge 
                      variant="secondary"
                      className="hover:bg-primary hover:text-white cursor-pointer transition-colors"
                    >
                      {category.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}