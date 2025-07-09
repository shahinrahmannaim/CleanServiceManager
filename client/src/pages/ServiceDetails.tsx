import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '../lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, ShoppingCart, Star, Clock, MapPin, Calendar, User, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

const cities = ['Doha', 'Al Rayyan', 'Al Wakrah', 'Umm Salal', 'Al Daayen', 'Lusail', 'West Bay'];

const bookingSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  scheduledDate: z.string().min(1, 'Date is required'),
  scheduledTime: z.string().min(1, 'Time is required'),
  notes: z.string().optional(),
});

export default function ServiceDetails() {
  const [match, params] = useRoute('/services/:id');
  const serviceId = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  const { data: service, isLoading } = useQuery({
    queryKey: ['/api/services', serviceId],
    queryFn: async () => {
      const response = await fetch(`/api/services/${serviceId}`);
      return response.json();
    },
    enabled: !!serviceId,
  });

  const { data: favorites } = useQuery({
    queryKey: ['/api/favorites'],
    enabled: !!user,
    select: (data) => data?.some((fav: any) => fav.serviceId === parseInt(serviceId!)) || false,
  });

  const { data: cartItems } = useQuery({
    queryKey: ['/api/cart'],
    enabled: !!user,
    select: (data) => data?.some((item: any) => item.serviceId === parseInt(serviceId!)) || false,
  });

  const bookingForm = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      address: '',
      city: '',
      scheduledDate: '',
      scheduledTime: '',
      notes: '',
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: () => 
      isFavorite 
        ? apiRequest('DELETE', `/api/favorites/${serviceId}`)
        : apiRequest('POST', '/api/favorites', { serviceId: parseInt(serviceId!) }),
    onSuccess: () => {
      setIsFavorite(!isFavorite);
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: `${service?.name} has been ${isFavorite ? 'removed from' : 'added to'} your favorites.`,
      });
    },
  });

  const cartMutation = useMutation({
    mutationFn: () => 
      isInCart 
        ? apiRequest('DELETE', `/api/cart/${serviceId}`)
        : apiRequest('POST', '/api/cart', { serviceId: parseInt(serviceId!) }),
    onSuccess: () => {
      setIsInCart(!isInCart);
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: isInCart ? "Removed from cart" : "Added to cart",
        description: `${service?.name} has been ${isInCart ? 'removed from' : 'added to'} your cart.`,
      });
    },
  });

  const bookingMutation = useMutation({
    mutationFn: (data: z.infer<typeof bookingSchema>) => {
      const scheduledDateTime = new Date(`${data.scheduledDate}T${data.scheduledTime}`);
      return apiRequest('POST', '/api/bookings', {
        serviceId: parseInt(serviceId!),
        address: data.address,
        city: data.city,
        scheduledDate: scheduledDateTime.toISOString(),
        totalAmount: service?.price,
        notes: data.notes,
      });
    },
    onSuccess: () => {
      setIsBookingModalOpen(false);
      bookingForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "Booking confirmed!",
        description: "Your booking has been submitted successfully. We'll contact you soon.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Booking failed",
        description: error.message || "There was an error processing your booking.",
        variant: "destructive",
      });
    },
  });

  const handleBookingSubmit = (data: z.infer<typeof bookingSchema>) => {
    bookingMutation.mutate(data);
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-300 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-8 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="h-64 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
          <p className="text-gray-600 mb-8">The service you're looking for doesn't exist.</p>
          <Link href="/services">
            <Button className="btn-primary">Browse Services</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-96 bg-gray-800">
        <img 
          src={service.image || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600"} 
          alt={service.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              {service.category?.name}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{service.name}</h1>
            <div className="flex items-center text-white space-x-4">
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                {service.duration} minutes
              </div>
              <div className="flex items-center text-yellow-400">
                <Star className="w-5 h-5 fill-current mr-1" />
                4.8 (124 reviews)
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Service Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-6">{service.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">What's Included:</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Professional cleaning equipment</li>
                      <li>• Eco-friendly cleaning products</li>
                      <li>• Insured and licensed cleaners</li>
                      <li>• Quality guarantee</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Service Details:</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Duration: {service.duration} minutes</li>
                      <li>• Available in all Qatar cities</li>
                      <li>• Same-day booking available</li>
                      <li>• 100% satisfaction guarantee</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { name: "Ahmed Al-Rashid", rating: 5, comment: "Excellent service! Very professional and thorough.", date: "2 days ago" },
                    { name: "Sarah Johnson", rating: 5, comment: "Great value for money. Will definitely book again.", date: "1 week ago" },
                    { name: "Mohammed Al-Thani", rating: 4, comment: "Good service, arrived on time and did a great job.", date: "2 weeks ago" },
                  ].map((review, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium">{review.name}</div>
                            <div className="flex items-center text-yellow-500">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-current" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">{review.date}</div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Book This Service</span>
                  <div className="qar-price">{service.price}</div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleFavoriteClick}
                    disabled={favoriteMutation.isPending}
                    className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors ${
                      favorites ? 'bg-accent text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${favorites ? 'fill-current' : ''}`} />
                    {favorites ? 'Favorited' : 'Add to Favorites'}
                  </button>
                  
                  <button
                    onClick={handleCartClick}
                    disabled={cartMutation.isPending}
                    className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors ${
                      cartItems ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ShoppingCart className={`w-4 h-4 mr-2 ${cartItems ? 'fill-current' : ''}`} />
                    {cartItems ? 'In Cart' : 'Add to Cart'}
                  </button>
                </div>

                <Separator />

                <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full btn-accent text-lg py-3">
                      <Calendar className="w-5 h-5 mr-2" />
                      Book Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Book {service.name}</DialogTitle>
                    </DialogHeader>
                    
                    <Form {...bookingForm}>
                      <form onSubmit={bookingForm.handleSubmit(handleBookingSubmit)} className="space-y-4">
                        <FormField
                          control={bookingForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Enter your full address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={bookingForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select city" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {cities.map((city) => (
                                    <SelectItem key={city} value={city}>
                                      {city}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={bookingForm.control}
                            name="scheduledDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={bookingForm.control}
                            name="scheduledTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Time</FormLabel>
                                <FormControl>
                                  <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={bookingForm.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Special Instructions (Optional)</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Any special requests or notes..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <span className="font-medium">Total Amount:</span>
                          <span className="qar-price">{service.price}</span>
                        </div>

                        <Button
                          type="submit"
                          disabled={bookingMutation.isPending}
                          className="w-full btn-primary"
                        >
                          {bookingMutation.isPending ? 'Processing...' : 'Confirm Booking'}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <div className="text-sm text-gray-500">
                  <p>• Same-day booking available</p>
                  <p>• 100% satisfaction guarantee</p>
                  <p>• Professional insured cleaners</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
