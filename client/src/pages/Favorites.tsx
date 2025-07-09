import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { apiRequest } from '../lib/queryClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Clock, Star, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

export default function Favorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['/api/favorites'],
    enabled: !!user,
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ['/api/cart'],
    enabled: !!user,
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (serviceId: number) =>
      apiRequest('DELETE', `/api/favorites/${serviceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Removed from favorites",
        description: "Service has been removed from your favorites.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove from favorites",
        variant: "destructive",
      });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: (serviceId: number) =>
      apiRequest('POST', '/api/cart', { serviceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to cart",
        description: "Service has been added to your cart.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive",
      });
    },
  });

  const isInCart = (serviceId: number) => {
    return cartItems.some((item: any) => item.serviceId === serviceId);
  };

  const handleRemoveFavorite = (serviceId: number) => {
    if (window.confirm('Are you sure you want to remove this service from your favorites?')) {
      removeFavoriteMutation.mutate(serviceId);
    }
  };

  const handleAddToCart = (serviceId: number) => {
    if (isInCart(serviceId)) {
      toast({
        title: "Already in cart",
        description: "This service is already in your cart.",
      });
      return;
    }
    addToCartMutation.mutate(serviceId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please login to view your favorites.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-600">Your favorite cleaning services</p>
        </div>

        {favorites?.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-8">
              Browse our services and add your favorites for quick access!
            </p>
            <Link href="/services">
              <Button className="btn-primary">Browse Services</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-lg text-gray-700">
                {favorites.length} favorite service{favorites.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite: any) => (
                <Card key={favorite.id} className="service-card card-hover">
                  <div className="relative">
                    <img 
                      src={favorite.service?.image || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"} 
                      alt={favorite.service?.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-white/90 text-primary">
                        {favorite.service?.category?.name}
                      </Badge>
                    </div>
                    <button
                      onClick={() => handleRemoveFavorite(favorite.serviceId)}
                      className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {favorite.service?.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {favorite.service?.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        {favorite.service?.duration} min
                      </div>
                      <div className="flex items-center text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="ml-1 text-gray-600 text-sm">4.8 (124 reviews)</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="qar-price">{favorite.service?.price}</div>
                      <Link href={`/services/${favorite.serviceId}`}>
                        <Button className="btn-accent">
                          Book Now
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        onClick={() => handleAddToCart(favorite.serviceId)}
                        disabled={addToCartMutation.isPending || isInCart(favorite.serviceId)}
                        className="flex items-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {isInCart(favorite.serviceId) ? 'In Cart' : 'Add to Cart'}
                      </Button>
                      
                      <button
                        onClick={() => handleRemoveFavorite(favorite.serviceId)}
                        disabled={removeFavoriteMutation.isPending}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Heart className="w-5 h-5 fill-current" />
                      </button>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      Added {new Date(favorite.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
