import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '../../lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Search, Plus, Edit, Trash2, CreditCard, Wallet, Building } from 'lucide-react';
import AdminNavigation from '@/components/AdminNavigation';
import { useToast } from '@/hooks/use-toast';

const paymentMethodSchema = z.object({
  name: z.string().min(1, 'Payment method name is required'),
  providerType: z.string().min(1, 'Provider type is required'),
  isActive: z.boolean(),
  config: z.string().optional(),
});

const PROVIDER_TYPES = [
  { value: 'credit_card', label: 'Credit Card', icon: CreditCard },
  { value: 'mobile_wallet', label: 'Mobile Wallet', icon: Wallet },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: Building },
  { value: 'cash', label: 'Cash Payment', icon: Wallet },
];

export default function AdminPaymentMethods() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ['/api/payment-methods'],
  });

  const paymentMethodForm = useForm<z.infer<typeof paymentMethodSchema>>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      name: '',
      providerType: '',
      isActive: true,
      config: '',
    },
  });

  const createPaymentMethodMutation = useMutation({
    mutationFn: (data: z.infer<typeof paymentMethodSchema>) =>
      apiRequest('POST', '/api/payment-methods', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      setIsCreateModalOpen(false);
      paymentMethodForm.reset();
      toast({
        title: "Payment method created",
        description: "New payment method has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error.message || "Failed to create payment method.",
        variant: "destructive",
      });
    },
  });

  const updatePaymentMethodMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: z.infer<typeof paymentMethodSchema> }) =>
      apiRequest('PUT', `/api/payment-methods/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      setIsEditModalOpen(false);
      setSelectedPaymentMethod(null);
      toast({
        title: "Payment method updated",
        description: "Payment method has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update payment method.",
        variant: "destructive",
      });
    },
  });

  const deletePaymentMethodMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/payment-methods/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      toast({
        title: "Payment method deleted",
        description: "Payment method has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete payment method.",
        variant: "destructive",
      });
    },
  });

  const handleCreatePaymentMethod = (data: z.infer<typeof paymentMethodSchema>) => {
    createPaymentMethodMutation.mutate(data);
  };

  const handleEditPaymentMethod = (paymentMethod: any) => {
    setSelectedPaymentMethod(paymentMethod);
    paymentMethodForm.reset({
      name: paymentMethod.name,
      providerType: paymentMethod.providerType,
      isActive: paymentMethod.isActive,
      config: paymentMethod.config || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdatePaymentMethod = (data: z.infer<typeof paymentMethodSchema>) => {
    if (selectedPaymentMethod) {
      updatePaymentMethodMutation.mutate({ id: selectedPaymentMethod.id, data });
    }
  };

  const handleDeletePaymentMethod = (id: number, name: string) => {
    deletePaymentMethodMutation.mutate(id);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getProviderIcon = (providerType: string) => {
    const provider = PROVIDER_TYPES.find(p => p.value === providerType);
    return provider ? provider.icon : CreditCard;
  };

  const getProviderLabel = (providerType: string) => {
    const provider = PROVIDER_TYPES.find(p => p.value === providerType);
    return provider ? provider.label : providerType;
  };

  const filteredPaymentMethods = paymentMethods?.filter((method: any) => {
    const matchesSearch = !searchQuery || 
      method.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      method.providerType.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  }) || [];

  const activePaymentMethods = filteredPaymentMethods.filter((m: any) => m.isActive);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
            <div className="h-64 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Navigation */}
        <AdminNavigation className="mb-6" />
        
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Methods</h1>
              <p className="text-gray-600">Manage available payment options for customers</p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Payment Method
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search payment methods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Methods</p>
                  <p className="text-2xl font-bold">{paymentMethods?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Active Methods</p>
                  <p className="text-2xl font-bold">{activePaymentMethods.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Wallet className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Provider Types</p>
                  <p className="text-2xl font-bold">
                    {new Set(paymentMethods?.map((m: any) => m.providerType)).size || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods ({filteredPaymentMethods.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Provider Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Configuration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPaymentMethods.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">No payment methods found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPaymentMethods.map((method: any) => {
                      const ProviderIcon = getProviderIcon(method.providerType);
                      return (
                        <TableRow key={method.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <ProviderIcon className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{method.name}</p>
                                <p className="text-sm text-gray-600">
                                  Created {new Date(method.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {getProviderLabel(method.providerType)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(method.isActive)}>
                              {method.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {method.config ? (
                                <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                  Configured
                                </span>
                              ) : (
                                <span className="text-gray-400">No configuration</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditPaymentMethod(method)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{method.name}"? This action cannot be undone and will remove this payment option from all services.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeletePaymentMethod(method.id, method.name)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Create Payment Method Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Payment Method</DialogTitle>
            </DialogHeader>
            
            <Form {...paymentMethodForm}>
              <form onSubmit={paymentMethodForm.handleSubmit(handleCreatePaymentMethod)} className="space-y-4">
                <FormField
                  control={paymentMethodForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Visa/Mastercard" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentMethodForm.control}
                  name="providerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROVIDER_TYPES.map((provider) => (
                            <SelectItem key={provider.value} value={provider.value}>
                              <div className="flex items-center">
                                <provider.icon className="w-4 h-4 mr-2" />
                                {provider.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentMethodForm.control}
                  name="config"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Configuration (JSON)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder='{"apiKey": "xxx", "environment": "sandbox"}'
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentMethodForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Active</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createPaymentMethodMutation.isPending}
                    className="btn-primary"
                  >
                    {createPaymentMethodMutation.isPending ? 'Creating...' : 'Create Payment Method'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Payment Method Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Payment Method</DialogTitle>
            </DialogHeader>
            
            <Form {...paymentMethodForm}>
              <form onSubmit={paymentMethodForm.handleSubmit(handleUpdatePaymentMethod)} className="space-y-4">
                <FormField
                  control={paymentMethodForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentMethodForm.control}
                  name="providerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROVIDER_TYPES.map((provider) => (
                            <SelectItem key={provider.value} value={provider.value}>
                              <div className="flex items-center">
                                <provider.icon className="w-4 h-4 mr-2" />
                                {provider.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentMethodForm.control}
                  name="config"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Configuration (JSON)</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentMethodForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Active</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updatePaymentMethodMutation.isPending}
                    className="btn-primary"
                  >
                    {updatePaymentMethodMutation.isPending ? 'Updating...' : 'Update Payment Method'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
