import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { apiRequest } from '../lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, MapPin, Clock, User, Phone, Mail, Star, MessageCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Bookings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['/api/bookings'],
    enabled: !!user,
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: number) =>
      apiRequest('PUT', `/api/bookings/${bookingId}`, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation failed",
        description: error.message || "Failed to cancel booking.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const filterBookings = (status?: string) => {
    if (!bookings) return [];
    if (!status) return bookings;
    return bookings.filter((booking: any) => booking.status === status);
  };

  const canCancelBooking = (booking: any) => {
    const scheduledDate = new Date(booking.scheduledDate);
    const now = new Date();
    const timeDiff = scheduledDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    return booking.status === 'pending' || booking.status === 'confirmed' && hoursDiff > 24;
  };

  const handleCancelBooking = (bookingId: number) => {
    cancelBookingMutation.mutate(bookingId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-gray-300 rounded-lg"></div>
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
          <p className="text-gray-600">Please login to view your bookings.</p>
        </div>
      </div>
    );
  }

  const allBookings = filterBookings();
  const pendingBookings = filterBookings('pending');
  const confirmedBookings = filterBookings('confirmed');
  const completedBookings = filterBookings('completed');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your cleaning service bookings</p>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({allBookings.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({confirmedBookings.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <BookingsList bookings={allBookings} onCancel={handleCancelBooking} onViewDetails={setSelectedBooking} />
          </TabsContent>

          <TabsContent value="pending">
            <BookingsList bookings={pendingBookings} onCancel={handleCancelBooking} onViewDetails={setSelectedBooking} />
          </TabsContent>

          <TabsContent value="confirmed">
            <BookingsList bookings={confirmedBookings} onCancel={handleCancelBooking} onViewDetails={setSelectedBooking} />
          </TabsContent>

          <TabsContent value="completed">
            <BookingsList bookings={completedBookings} onCancel={handleCancelBooking} onViewDetails={setSelectedBooking} />
          </TabsContent>
        </Tabs>

        {/* Booking Details Modal */}
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
            </DialogHeader>
            
            {selectedBooking && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{selectedBooking.service?.name}</h3>
                  <Badge className={getStatusColor(selectedBooking.status)}>
                    {getStatusText(selectedBooking.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Booking Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <span>Date: {new Date(selectedBooking.scheduledDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        <span>Time: {new Date(selectedBooking.scheduledDate).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        <span>City: {selectedBooking.city}</span>
                      </div>
                      <div className="mt-4">
                        <strong>Address:</strong>
                        <p className="mt-1 text-gray-600">{selectedBooking.address}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Service Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Service:</strong> {selectedBooking.service?.name}
                      </div>
                      <div>
                        <strong>Duration:</strong> {selectedBooking.service?.duration} minutes
                      </div>
                      <div>
                        <strong>Amount:</strong> {selectedBooking.totalAmount} QAR
                      </div>
                      <div>
                        <strong>Category:</strong> {selectedBooking.service?.category?.name}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedBooking.employee && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Assigned Employee</h4>
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{selectedBooking.employee.name}</div>
                        <div className="text-sm text-gray-600">{selectedBooking.employee.email}</div>
                        <div className="text-sm text-gray-600">{selectedBooking.employee.mobile}</div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedBooking.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Special Instructions</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                      {selectedBooking.notes}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Booked on {new Date(selectedBooking.createdAt).toLocaleDateString()}
                  </div>
                  <div className="space-x-2">
                    {canCancelBooking(selectedBooking) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            Cancel Booking
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this booking? This action cannot be undone and you may be charged a cancellation fee.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => {
                                handleCancelBooking(selectedBooking.id);
                                setSelectedBooking(null);
                              }}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Cancel Booking
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    <Button onClick={() => setSelectedBooking(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function BookingsList({ 
  bookings, 
  onCancel, 
  onViewDetails 
}: { 
  bookings: any[], 
  onCancel: (id: number) => void,
  onViewDetails: (booking: any) => void 
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const canCancelBooking = (booking: any) => {
    const scheduledDate = new Date(booking.scheduledDate);
    const now = new Date();
    const timeDiff = scheduledDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    return booking.status === 'pending' || booking.status === 'confirmed' && hoursDiff > 24;
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
        <p className="text-gray-600">You haven't made any bookings yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking: any) => (
        <Card key={booking.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{booking.service?.name}</h3>
                <p className="text-sm text-gray-600">{booking.service?.description}</p>
              </div>
              <Badge className={getStatusColor(booking.status)}>
                {getStatusText(booking.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {new Date(booking.scheduledDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {new Date(booking.scheduledDate).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">{booking.city}</span>
              </div>
            </div>

            {booking.employee && (
              <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium">{booking.employee.name}</div>
                  <div className="text-xs text-gray-600">Assigned Employee</div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-primary">
                {booking.totalAmount} QAR
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => onViewDetails(booking)}
                  className="text-sm"
                >
                  View Details
                </Button>
                {canCancelBooking(booking) && (
                  <Button
                    variant="destructive"
                    onClick={() => onCancel(booking.id)}
                    className="text-sm"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
