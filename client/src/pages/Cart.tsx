import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { apiRequest } from '../lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Trash2, Plus, Minus, Clock, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Cart() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['/api/cart'],
    enabled: !!user,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      apiRequest('PUT', `/api/cart/${id}`, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update quantity",
        variant: "destructive",
      });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest('DELETE', `/api/cart/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Removed from cart",
        description: "Service has been removed from your cart.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove from cart",
        variant: "destructive",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', '/api/cart/clear'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clear cart",
        variant: "destructive",
      });
    },
  });

  const handleUpdateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    updateQuantityMutation.mutate({ id, quantity });
  };

  const handleRemoveItem = (id: number) => {
    removeFromCartMutation.mutate(id);
  };

  const handleClearCart = () => {
    clearCartMutation.mutate();
  };

  const totalAmount = cartItems?.reduce((sum: number, item: any) => {
    return sum + (parseFloat(item.service?.price || '0') * item.quantity);
  }, 0) || 0;

  const totalItems = cartItems?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="h-64 bg-gray-300 rounded-lg"></div>
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
          <p className="text-gray-600">Please login to view your cart.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">Review your selected services</p>
        </div>

        {cartItems?.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-8">
              Add some services to your cart to get started!
            </p>
            <Link href="/services">
              <Button className="btn-primary">Browse Services</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Cart Items ({totalItems})</CardTitle>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={clearCartMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          Clear Cart
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Clear Cart</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to clear your entire cart? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleClearCart}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Clear Cart
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartItems.map((item: any) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <img 
                            src={item.service?.image || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150"} 
                            alt={item.service?.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {item.service?.name}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-1">
                                {item.service?.description}
                              </p>
                              <div className="flex items-center mt-1">
                                <Badge variant="secondary" className="mr-2">
                                  {item.service?.category?.name}
                                </Badge>
                                <div className="flex items-center text-gray-500 text-sm">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {item.service?.duration} min
                                </div>
                              </div>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button className="text-red-500 hover:text-red-700 transition-colors">
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Item</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove this item from your cart?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Quantity:</span>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                                  className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  disabled={updateQuantityMutation.isPending}
                                  className="p-1 rounded-full hover:bg-gray-100"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="text-lg font-semibold text-primary">
                              {(parseFloat(item.service?.price || '0') * item.quantity).toFixed(2)} QAR
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>{totalAmount.toFixed(2)} QAR</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Service Fee</span>
                      <span>0.00 QAR</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Discount</span>
                      <span className="text-green-600">-0.00 QAR</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{totalAmount.toFixed(2)} QAR</span>
                  </div>
                  
                  <Button className="w-full btn-accent text-lg py-3" disabled={totalItems === 0}>
                    Proceed to Checkout
                  </Button>
                  
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>• Same-day booking available</p>
                    <p>• 100% satisfaction guarantee</p>
                    <p>• Professional insured cleaners</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
