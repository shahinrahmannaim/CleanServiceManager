import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '../lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, Calendar, Shield, Star, Edit2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(8, 'Mobile number must be at least 8 digits'),
});

export default function Profile() {
  const { user, refetch } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: bookings } = useQuery({
    queryKey: ['/api/bookings'],
    enabled: !!user,
  });

  const { data: favorites } = useQuery({
    queryKey: ['/api/favorites'],
    enabled: !!user,
  });

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: z.infer<typeof profileSchema>) =>
      apiRequest('PUT', `/api/users/${user?.id}`, data),
    onSuccess: () => {
      setIsEditing(false);
      refetch();
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const handleSave = (data: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancel = () => {
    setIsEditing(false);
    profileForm.reset({
      name: user?.name || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
    });
  };

  const recentBookings = bookings?.slice(0, 3) || [];
  const totalBookings = bookings?.length || 0;
  const completedBookings = bookings?.filter((booking: any) => booking.status === 'completed').length || 0;
  const totalSpent = bookings?.reduce((sum: number, booking: any) => sum + parseFloat(booking.totalAmount || '0'), 0) || 0;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'superadmin':
        return 'bg-red-100 text-red-800';
      case 'employee':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please login to access your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarFallback className="text-2xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <div className="flex justify-center mt-2">
                  <Badge className={getRoleColor(user.role)}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="text-sm">{user.mobile}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{totalBookings}</div>
                    <div className="text-sm text-gray-600">Total Bookings</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{completedBookings}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{totalSpent.toFixed(2)} QAR</div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="bookings">Recent Bookings</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Profile Information</CardTitle>
                      {!isEditing ? (
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Profile
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </Button>
                          <Button
                            onClick={profileForm.handleSubmit(handleSave)}
                            disabled={updateProfileMutation.isPending}
                            className="flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form className="space-y-6">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditing}
                                  className={!isEditing ? 'bg-gray-50' : ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditing}
                                  className={!isEditing ? 'bg-gray-50' : ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="mobile"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mobile Number</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditing}
                                  className={!isEditing ? 'bg-gray-50' : ''}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Account Status</label>
                            <div className="mt-1 flex items-center gap-2">
                              <Shield className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-600">Verified</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Member Since</label>
                            <div className="mt-1 text-sm text-gray-600">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bookings">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentBookings.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">No bookings yet</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Start booking our cleaning services!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentBookings.map((booking: any) => (
                          <div key={booking.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">{booking.service?.name}</h3>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                {new Date(booking.scheduledDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                {booking.city}
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="font-medium">{booking.totalAmount} QAR</span>
                                <span className="text-xs text-gray-500">
                                  Booked {new Date(booking.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="favorites">
                <Card>
                  <CardHeader>
                    <CardTitle>Favorite Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {favorites?.length === 0 ? (
                      <div className="text-center py-8">
                        <Star className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">No favorite services yet</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Browse our services and add your favorites!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {favorites?.map((favorite: any) => (
                          <div key={favorite.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold">{favorite.service?.name}</h3>
                                <p className="text-sm text-gray-600">{favorite.service?.description}</p>
                                <div className="flex items-center mt-2">
                                  <Badge variant="secondary">{favorite.service?.category?.name}</Badge>
                                  <span className="ml-2 font-medium text-primary">
                                    {favorite.service?.price} QAR
                                  </span>
                                </div>
                              </div>
                              <Button size="sm" className="btn-accent">
                                Book Now
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
