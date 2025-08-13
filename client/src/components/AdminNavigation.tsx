import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home,
  Users,
  Package,
  Tags,
  Calendar,
  CreditCard,
  UserCheck,
  Settings,
  ChevronRight,
  BarChart3
} from 'lucide-react';

interface AdminNavigationProps {
  className?: string;
}

export default function AdminNavigation({ className = '' }: AdminNavigationProps) {
  const [location] = useLocation();

  const navigationItems = [
    { 
      href: '/admin/dashboard', 
      label: 'Dashboard', 
      icon: Home, 
      description: 'Overview & stats' 
    },
    { 
      href: '/admin/categories', 
      label: 'Categories', 
      icon: Tags, 
      description: 'Service categories' 
    },
    { 
      href: '/admin/services', 
      label: 'Services', 
      icon: Package, 
      description: 'Manage services' 
    },
    { 
      href: '/admin/bookings', 
      label: 'Bookings', 
      icon: Calendar, 
      description: 'Customer bookings' 
    },
    { 
      href: '/admin/users', 
      label: 'Users', 
      icon: Users, 
      description: 'Customer accounts' 
    },
    { 
      href: '/admin/promotions', 
      label: 'Promotions', 
      icon: BarChart3, 
      description: 'Discounts & offers' 
    },
    { 
      href: '/admin/employees', 
      label: 'Employees', 
      icon: UserCheck, 
      description: 'Staff management' 
    },
    { 
      href: '/admin/payment-methods', 
      label: 'Payments', 
      icon: CreditCard, 
      description: 'Payment options' 
    },
  ];

  const currentIndex = navigationItems.findIndex(item => location === item.href);
  const previousItem = currentIndex > 0 ? navigationItems[currentIndex - 1] : null;
  const nextItem = currentIndex < navigationItems.length - 1 ? navigationItems[currentIndex + 1] : null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quick Navigation Bar */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            {/* Previous Button */}
            <div className="flex-1">
              {previousItem && (
                <Link href={previousItem.href}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center space-x-2 text-xs"
                  >
                    <ChevronRight className="w-3 h-3 rotate-180" />
                    <span className="hidden sm:inline">Previous:</span>
                    <span>{previousItem.label}</span>
                  </Button>
                </Link>
              )}
            </div>

            {/* Current Page Indicator */}
            <div className="flex-1 text-center">
              <span className="text-sm font-medium text-gray-600">
                {currentIndex + 1} of {navigationItems.length}
              </span>
            </div>

            {/* Next Button */}
            <div className="flex-1 flex justify-end">
              {nextItem && (
                <Link href={nextItem.href}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center space-x-2 text-xs"
                  >
                    <span className="hidden sm:inline">Next:</span>
                    <span>{nextItem.label}</span>
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Navigation Grid - Mobile Responsive */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Access</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className={`w-full h-auto flex flex-col items-center justify-center p-3 space-y-1 ${
                      isActive 
                        ? 'bg-[#063580] hover:bg-[#063580]/90 text-white' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                    <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-700'}`}>
                      {item.label}
                    </span>
                    <span className={`text-xs ${isActive ? 'text-gray-200' : 'text-gray-500'} hidden sm:block`}>
                      {item.description}
                    </span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}