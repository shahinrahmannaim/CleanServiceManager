import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { apiRequest } from '../lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Star, Clock, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

interface ServiceCardProps {
  service: {
    id: number;
    name: string;
    description: string;
    price: string;
    duration: number;
    image: string;
    category: {
      name: string;
    };
  };
  isFavorite?: boolean;
  isInCart?: boolean;
}

export default function ServiceCard({ service, isFavorite = false, isInCart = false }: ServiceCardProps) {
  const [favoriteState, setFavoriteState] = useState(isFavorite);
  const [cartState, setCartState] = useState(isInCart);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const favoriteMutation = useMutation({
    mutationFn: () => 
      favoriteState 
        ? apiRequest('DELETE', `/api/favorites/${service.id}`)
        : apiRequest('POST', '/api/favorites', { serviceId: service.id }),
    onSuccess: () => {
      setFavoriteState(!favoriteState);
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: favoriteState ? "Removed from favorites" : "Added to favorites",
        description: `${service.name} has been ${favoriteState ? 'removed from' : 'added to'} your favorites.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const cartMutation = useMutation({
    mutationFn: () => 
      cartState 
        ? apiRequest('DELETE', `/api/cart/${service.id}`)
        : apiRequest('POST', '/api/cart', { serviceId: service.id }),
    onSuccess: () => {
      setCartState(!cartState);
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: cartState ? "Removed from cart" : "Added to cart",
        description: `${service.name} has been ${cartState ? 'removed from' : 'added to'} your cart.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteClick = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add favorites",
        variant: "destructive",
      });
      return;
    }
    favoriteMutation.mutate();
  };

  const handleCartClick = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      return;
    }
    cartMutation.mutate();
  };

  return (
    <Card className="service-card card-hover">
      <div className="relative">
        <img 
          src={service.image || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"} 
          alt={service.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-white/90 text-primary">
            {service.category?.name}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="w-4 h-4 mr-1" />
            {service.duration} min
          </div>
          <div className="flex items-center text-yellow-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 text-gray-600 text-sm">4.8 (124 reviews)</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="qar-price">{service.price}</div>
          <Link href={`/services/${service.id}`}>
            <Button className="btn-accent">
              Book Now
            </Button>
          </Link>
        </div>
        
        <div className="mt-4 flex items-center space-x-4">
          <button
            onClick={handleFavoriteClick}
            disabled={favoriteMutation.isPending}
            className={`transition-colors ${
              favoriteState 
                ? 'text-accent hover:text-accent/80' 
                : 'text-gray-400 hover:text-accent'
            }`}
          >
            <Heart className={`w-5 h-5 ${favoriteState ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={handleCartClick}
            disabled={cartMutation.isPending}
            className={`transition-colors ${
              cartState 
                ? 'text-primary hover:text-primary/80' 
                : 'text-gray-400 hover:text-primary'
            }`}
          >
            <ShoppingCart className={`w-5 h-5 ${cartState ? 'fill-current' : ''}`} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
