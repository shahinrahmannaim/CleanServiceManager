import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, User, MapPin, Lock, Home, Building, MapIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

// Validation schemas
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid mobile number"),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword || data.confirmPassword) {
    return data.currentPassword && data.newPassword && data.confirmPassword;
  }
  return true;
}, {
  message: "Current password is required when changing password",
  path: ["currentPassword"],
}).refine((data) => {
  if (data.newPassword && data.confirmPassword) {
    return data.newPassword === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const addressSchema = z.object({
  type: z.enum(["home", "work", "other"]),
  street: z.string().min(5, "Street address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  area: z.string().min(2, "Area must be at least 2 characters"),
  building: z.string().optional(),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  instructions: z.string().optional(),
  isDefault: z.boolean().default(false),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type AddressFormData = z.infer<typeof addressSchema>;

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  // Queries
  const { data: addresses = [] } = useQuery({
    queryKey: ["/api/addresses"],
    enabled: !!user,
  });

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      mobile: user?.mobile || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Address form
  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      type: "home",
      street: "",
      city: "",
      area: "",
      building: "",
      floor: "",
      apartment: "",
      instructions: "",
      isDefault: false,
    },
  });

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => apiRequest("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      profileForm.reset({
        ...profileForm.getValues(),
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const createAddressMutation = useMutation({
    mutationFn: (data: AddressFormData) => apiRequest("/api/addresses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: "Address added",
        description: "Your address has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      setIsAddressDialogOpen(false);
      addressForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add address",
        variant: "destructive",
      });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AddressFormData }) => 
      apiRequest(`/api/addresses/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Address updated",
        description: "Your address has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
      setIsAddressDialogOpen(false);
      setEditingAddress(null);
      addressForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update address",
        variant: "destructive",
      });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/addresses/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      toast({
        title: "Address deleted",
        description: "Your address has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/addresses"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete address",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleProfileSubmit = (data: ProfileFormData) => {
    const submitData = { ...data };
    if (!submitData.newPassword) {
      delete submitData.currentPassword;
      delete submitData.newPassword;
      delete submitData.confirmPassword;
    }
    updateProfileMutation.mutate(submitData);
  };

  const handleAddressSubmit = (data: AddressFormData) => {
    if (editingAddress) {
      updateAddressMutation.mutate({ id: editingAddress.id, data });
    } else {
      createAddressMutation.mutate(data);
    }
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    addressForm.reset({
      type: address.type,
      street: address.street,
      city: address.city,
      area: address.area,
      building: address.building || "",
      floor: address.floor || "",
      apartment: address.apartment || "",
      instructions: address.instructions || "",
      isDefault: address.isDefault,
    });
    setIsAddressDialogOpen(true);
  };

  const handleDeleteAddress = (id: number) => {
    if (confirm("Are you sure you want to delete this address?")) {
      deleteAddressMutation.mutate(id);
    }
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="h-4 w-4" />;
      case "work":
        return <Building className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapIcon className="h-4 w-4" />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your email" {...field} />
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
                              <Input placeholder="Enter your mobile number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{user.role}</Badge>
                        <span className="text-sm text-gray-500">Role</span>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Addresses</CardTitle>
                    <CardDescription>
                      Manage your saved addresses for faster booking
                    </CardDescription>
                  </div>
                  <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingAddress(null);
                        addressForm.reset();
                      }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingAddress ? "Edit Address" : "Add New Address"}
                        </DialogTitle>
                      </DialogHeader>
                      <Form {...addressForm}>
                        <form onSubmit={addressForm.handleSubmit(handleAddressSubmit)} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={addressForm.control}
                              name="type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Address Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select address type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="home">Home</SelectItem>
                                      <SelectItem value="work">Work</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={addressForm.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter city" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={addressForm.control}
                              name="area"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Area</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter area" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={addressForm.control}
                              name="building"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Building (Optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter building name/number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={addressForm.control}
                              name="floor"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Floor (Optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter floor number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={addressForm.control}
                              name="apartment"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Apartment (Optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter apartment number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={addressForm.control}
                            name="street"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Street Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter street address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={addressForm.control}
                            name="instructions"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Delivery Instructions (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Enter any special delivery instructions" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={addressForm.control}
                            name="isDefault"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Set as default address</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />

                          <div className="flex gap-2">
                            <Button 
                              type="submit" 
                              disabled={createAddressMutation.isPending || updateAddressMutation.isPending}
                            >
                              {createAddressMutation.isPending || updateAddressMutation.isPending 
                                ? "Saving..." 
                                : editingAddress ? "Update Address" : "Add Address"
                              }
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setIsAddressDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No addresses saved yet</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Add your first address to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address: any) => (
                      <div key={address.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getAddressTypeIcon(address.type)}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium capitalize">{address.type}</span>
                                {address.isDefault && (
                                  <Badge variant="secondary" className="text-xs">Default</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {address.street}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {address.area}, {address.city}
                              </p>
                              {(address.building || address.floor || address.apartment) && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {[address.building, address.floor && `Floor ${address.floor}`, address.apartment && `Apt ${address.apartment}`].filter(Boolean).join(", ")}
                                </p>
                              )}
                              {address.instructions && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {address.instructions}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAddress(address)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAddress(address.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter current password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter new password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm new password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}