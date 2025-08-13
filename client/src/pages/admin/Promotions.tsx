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
import { Switch } from '@/components/ui/switch';
import { Search, Plus, Edit, Trash2, Tag, Calendar, Percent } from 'lucide-react';
import AdminNavigation from '@/components/AdminNavigation';
import { useToast } from '@/hooks/use-toast';

const promotionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  image: z.string().optional(),
  discountPercentage: z.string().optional(),
  discountAmount: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  isActive: z.boolean(),
}).refine((data) => {
  return data.discountPercentage || data.discountAmount;
}, {
  message: "Either discount percentage or discount amount is required",
  path: ["discountPercentage"],
});

export default function AdminPromotions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: promotions, isLoading } = useQuery({
    queryKey: ['/api/promotions/all'],
  });

  const promotionForm = useForm<z.infer<typeof promotionSchema>>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      title: '',
      description: '',
      image: '',
      discountPercentage: '',
      discountAmount: '',
      startDate: '',
      endDate: '',
      isActive: true,
    },
  });

  const createPromotionMutation = useMutation({
    mutationFn: (data: z.infer<typeof promotionSchema>) => {
      const formattedData = {
        title: data.title,
        description: data.description || null,
        image: data.image || null,
        discountPercentage: data.discountPercentage ? parseFloat(data.discountPercentage) : null,
        discountAmount: data.discountAmount ? parseFloat(data.discountAmount) : null,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive
      };
      return apiRequest('POST', '/api/promotions', formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/promotions/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/promotions'] });
      setIsCreateModalOpen(false);
      promotionForm.reset();
      toast({
        title: "Promotion created",
        description: "New promotion has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error.message || "Failed to create promotion.",
        variant: "destructive",
      });
    },
  });

  const updatePromotionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: z.infer<typeof promotionSchema> }) => {
      const formattedData = {
        title: data.title,
        description: data.description || null,
        image: data.image || null,
        discountPercentage: data.discountPercentage ? parseFloat(data.discountPercentage) : null,
        discountAmount: data.discountAmount ? parseFloat(data.discountAmount) : null,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive
      };
      return apiRequest('PUT', `/api/promotions/${id}`, formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/promotions/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/promotions'] });
      setIsEditModalOpen(false);
      setSelectedPromotion(null);
      toast({
        title: "Promotion updated",
        description: "Promotion has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update promotion.",
        variant: "destructive",
      });
    },
  });

  const deletePromotionMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/promotions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/promotions/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/promotions'] });
      toast({
        title: "Promotion deleted",
        description: "Promotion has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete promotion.",
        variant: "destructive",
      });
    },
  });

  const handleCreatePromotion = (data: z.infer<typeof promotionSchema>) => {
    createPromotionMutation.mutate(data);
  };

  const handleEditPromotion = (promotion: any) => {
    setSelectedPromotion(promotion);
    promotionForm.reset({
      title: promotion.title,
      description: promotion.description || '',
      image: promotion.image || '',
      discountPercentage: promotion.discountPercentage?.toString() || '',
      discountAmount: promotion.discountAmount?.toString() || '',
      startDate: new Date(promotion.startDate).toISOString().split('T')[0],
      endDate: new Date(promotion.endDate).toISOString().split('T')[0],
      isActive: promotion.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdatePromotion = (data: z.infer<typeof promotionSchema>) => {
    if (selectedPromotion) {
      updatePromotionMutation.mutate({ id: selectedPromotion.id, data });
    }
  };

  const handleDeletePromotion = (id: number, title: string) => {
    deletePromotionMutation.mutate(id);
  };

  const getStatusColor = (promotion: any) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    if (!promotion.isActive) {
      return 'bg-gray-100 text-gray-800';
    } else if (now < startDate) {
      return 'bg-blue-100 text-blue-800';
    } else if (now > endDate) {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  };

  const getStatusText = (promotion: any) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    if (!promotion.isActive) {
      return 'Inactive';
    } else if (now < startDate) {
      return 'Scheduled';
    } else if (now > endDate) {
      return 'Expired';
    } else {
      return 'Active';
    }
  };

  const filteredPromotions = promotions?.filter((promotion: any) => {
    const matchesSearch = !searchQuery || 
      promotion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (promotion.description && promotion.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  }) || [];

  const activePromotions = filteredPromotions.filter((p: any) => {
    const now = new Date();
    const startDate = new Date(p.startDate);
    const endDate = new Date(p.endDate);
    return p.isActive && now >= startDate && now <= endDate;
  });

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Promotion Management</h1>
              <p className="text-gray-600">Create and manage promotional offers</p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Promotion
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search promotions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Promotion Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Tag className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Promotions</p>
                  <p className="text-2xl font-bold">{promotions?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Tag className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Active Now</p>
                  <p className="text-2xl font-bold">{activePromotions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Percent className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Avg. Discount</p>
                  <p className="text-2xl font-bold">
                    {promotions?.length ? 
                      Math.round(promotions.reduce((sum: number, p: any) => 
                        sum + (p.discountPercentage || 0), 0) / promotions.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold">
                    {promotions?.filter((p: any) => {
                      const now = new Date();
                      const startDate = new Date(p.startDate);
                      return p.isActive && now < startDate;
                    }).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Promotions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Promotions ({filteredPromotions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Promotion</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromotions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Tag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">No promotions found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPromotions.map((promotion: any) => (
                      <TableRow key={promotion.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                              <Tag className="w-6 h-6 text-accent" />
                            </div>
                            <div>
                              <p className="font-medium">{promotion.title}</p>
                              <p className="text-sm text-gray-600 line-clamp-1">
                                {promotion.description || 'No description'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {promotion.discountPercentage && (
                              <div className="flex items-center text-green-600">
                                <Percent className="w-4 h-4 mr-1" />
                                <span className="font-medium">{promotion.discountPercentage}% off</span>
                              </div>
                            )}
                            {promotion.discountAmount && (
                              <div className="text-green-600 font-medium">
                                {promotion.discountAmount} QAR off
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                              <span>{new Date(promotion.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="text-gray-500">
                              to {new Date(promotion.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(promotion)}>
                            {getStatusText(promotion)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditPromotion(promotion)}
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
                                  <AlertDialogTitle>Delete Promotion</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{promotion.title}"? This action cannot be undone and will remove this promotion from all active campaigns.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeletePromotion(promotion.id, promotion.title)}
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Create Promotion Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Promotion</DialogTitle>
            </DialogHeader>
            
            <Form {...promotionForm}>
              <form onSubmit={promotionForm.handleSubmit(handleCreatePromotion)} className="space-y-4">
                <FormField
                  control={promotionForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promotion Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 25% Off First Booking" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={promotionForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the promotion..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={promotionForm.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Percentage (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="25" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={promotionForm.control}
                    name="discountAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Amount (QAR)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="50.00" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={promotionForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={promotionForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={promotionForm.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={promotionForm.control}
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
                    disabled={createPromotionMutation.isPending}
                    className="btn-primary"
                  >
                    {createPromotionMutation.isPending ? 'Creating...' : 'Create Promotion'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Promotion Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Promotion</DialogTitle>
            </DialogHeader>
            
            <Form {...promotionForm}>
              <form onSubmit={promotionForm.handleSubmit(handleUpdatePromotion)} className="space-y-4">
                <FormField
                  control={promotionForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promotion Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={promotionForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={promotionForm.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Percentage (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={promotionForm.control}
                    name="discountAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Amount (QAR)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={promotionForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={promotionForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={promotionForm.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={promotionForm.control}
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
                    disabled={updatePromotionMutation.isPending}
                    className="btn-primary"
                  >
                    {updatePromotionMutation.isPending ? 'Updating...' : 'Update Promotion'}
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
