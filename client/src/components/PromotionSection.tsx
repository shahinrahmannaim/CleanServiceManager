import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Percent, Clock, ArrowRight } from 'lucide-react';

interface Promotion {
  id: number;
  title: string;
  description: string | null;
  image: string | null;
  discountPercentage: string | null;
  discountAmount: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function PromotionSection() {
  const { data: promotions, isLoading } = useQuery({
    queryKey: ['/api/promotions'],
  });

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-red-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 overflow-x-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[300px] animate-pulse">
                <div className="bg-gray-200 rounded-lg h-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!promotions || promotions.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getDiscountText = (promotion: Promotion) => {
    if (promotion.discountPercentage) {
      return `${promotion.discountPercentage}% OFF`;
    }
    if (promotion.discountAmount) {
      return `QAR ${promotion.discountAmount} OFF`;
    }
    return 'Special Offer';
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-red-50 py-8 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Special Offers</h2>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Limited Time
          </Badge>
        </div>
        
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {promotions.map((promotion: Promotion) => (
            <Card 
              key={promotion.id} 
              className="min-w-[300px] lg:min-w-[350px] bg-white shadow-lg hover:shadow-xl transition-shadow border-0 overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="relative">
                  {promotion.image ? (
                    <img 
                      src={promotion.image} 
                      alt={promotion.title}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-r from-blue-400 to-red-400 flex items-center justify-center">
                      <Percent className="w-12 h-12 text-white" />
                    </div>
                  )}
                  
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-red-500 text-white font-bold">
                      {getDiscountText(promotion)}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {promotion.title}
                  </h3>
                  
                  {promotion.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {promotion.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>Until {formatDate(promotion.endDate)}</span>
                    </div>
                    
                    <Link href="/services">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Shop Now
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}