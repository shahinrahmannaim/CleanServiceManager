import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Percent } from "lucide-react";
import { Link } from "wouter";

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
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="h-20 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl animate-pulse"></div>
        </div>
      </section>
    );
  }

  if (!promotions || promotions.length === 0) {
    return null;
  }

  // Get the best promotion (highest discount)
  const bestPromotion = promotions.reduce((best: Promotion, current: Promotion) => {
    const currentDiscount = current.discountPercentage ? parseFloat(current.discountPercentage) : 0;
    const bestDiscount = best.discountPercentage ? parseFloat(best.discountPercentage) : 0;
    return currentDiscount > bestDiscount ? current : best;
  });

  return (
    <section className="py-4">
      <div className="container mx-auto px-4">
        <Link href="/services">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 hover:from-orange-500 hover:via-orange-600 hover:to-orange-700 transition-all duration-300 cursor-pointer group">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute right-8 top-0 w-24 h-24 bg-white rounded-full -translate-y-12 translate-x-12"></div>
              <div className="absolute right-16 bottom-0 w-40 h-40 bg-white rounded-full translate-y-20 translate-x-20"></div>
            </div>
            
            {/* Large Percentage */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-6xl md:text-8xl font-bold text-white/20">
              {bestPromotion.discountPercentage}%
            </div>
            
            <div className="relative z-10 flex items-center justify-between p-6 md:p-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-white uppercase tracking-wide">
                    Available
                  </span>
                  <div className="flex items-center gap-1 text-white">
                    <Percent className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Up to {bestPromotion.discountPercentage}% off
                    </span>
                  </div>
                </div>
                
                <h2 className="text-white text-2xl md:text-3xl font-bold mb-2">
                  Book now, save more on services
                </h2>
                
                <p className="text-white/90 text-sm md:text-base mb-4">
                  {bestPromotion.description || "Don't miss out on these limited-time promotions for our premium facilities management services"}
                </p>
                
                <div className="flex items-center gap-2 text-white/80 text-xs">
                  <span>Valid until {new Date(bestPromotion.endDate).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>T&C apply</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-white group-hover:translate-x-1 transition-transform duration-200">
                <span className="hidden md:inline text-sm font-medium">Book Now</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}