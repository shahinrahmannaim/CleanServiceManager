import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search, 
  Filter,
  Users,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';

interface Seller {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: string;
  status: string;
  isVerifiedSeller: boolean;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  experienceYears: number;
  skills: string;
  createdAt: string;
  updatedAt: string;
}

interface SellerStats {
  totalSellers: number;
  activeSellers: number;
  pendingSellers: number;
  rejectedSellers: number;
}

export default function Sellers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch sellers data
  const { data: sellers = [], isLoading } = useQuery({
    queryKey: ['/api/sellers'],
    queryFn: () => apiRequest('/api/sellers'),
  });

  // Fetch seller statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/sellers/stats'],
    queryFn: () => apiRequest('/api/sellers/stats'),
  });

  // Approve seller mutation
  const approveSellerMutation = useMutation({
    mutationFn: (sellerId: number) => 
      apiRequest(`/api/sellers/${sellerId}/approve`, {
        method: 'PUT',
      }),
    onSuccess: () => {
      toast({
        title: "Seller approved",
        description: "Seller has been approved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sellers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sellers/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve seller",
        variant: "destructive",
      });
    },
  });

  // Reject seller mutation
  const rejectSellerMutation = useMutation({
    mutationFn: (sellerId: number) => 
      apiRequest(`/api/sellers/${sellerId}/reject`, {
        method: 'PUT',
      }),
    onSuccess: () => {
      toast({
        title: "Seller rejected",
        description: "Seller application has been rejected.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sellers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sellers/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject seller",
        variant: "destructive",
      });
    },
  });

  // Update seller status mutation
  const updateSellerStatusMutation = useMutation({
    mutationFn: ({ sellerId, status }: { sellerId: number; status: string }) => 
      apiRequest(`/api/sellers/${sellerId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "Seller status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sellers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sellers/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update seller status",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (seller: Seller) => {
    setSelectedSeller(seller);
    setIsDetailsOpen(true);
  };

  const handleApprove = (sellerId: number) => {
    approveSellerMutation.mutate(sellerId);
  };

  const handleReject = (sellerId: number) => {
    rejectSellerMutation.mutate(sellerId);
  };

  const handleStatusChange = (sellerId: number, status: string) => {
    updateSellerStatusMutation.mutate({ sellerId, status });
  };

  const getStatusBadge = (status: string, isVerified: boolean) => {
    if (status === 'pending') {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">Pending</Badge>;
    }
    if (status === 'rejected') {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    if (isVerified) {
      return <Badge variant="default" className="bg-green-50 text-green-800 border-green-300">Verified</Badge>;
    }
    return <Badge variant="secondary">Active</Badge>;
  };

  const filteredSellers = sellers.filter((seller: Seller) => {
    const matchesSearch = seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'pending' && seller.status === 'pending') ||
                         (statusFilter === 'active' && seller.status === 'active' && seller.isVerifiedSeller) ||
                         (statusFilter === 'rejected' && seller.status === 'rejected');
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading sellers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Management</h1>
          <p className="text-gray-600 mt-1">Manage seller applications and accounts</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSellers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sellers</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeSellers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingSellers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected Applications</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejectedSellers}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search sellers by name, email, or business..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sellers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sellers ({filteredSellers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSellers.map((seller: Seller) => (
                <TableRow key={seller.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{seller.name}</div>
                      <div className="text-sm text-gray-500">{seller.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{seller.businessName || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{seller.businessPhone || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{seller.mobile}</div>
                      <div className="text-sm text-gray-500">{seller.businessAddress || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{seller.experienceYears ? `${seller.experienceYears} years` : 'N/A'}</div>
                      <div className="text-sm text-gray-500">{seller.skills || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(seller.status, seller.isVerifiedSeller)}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(seller)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {seller.status === 'pending' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprove(seller.id)}
                            disabled={approveSellerMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(seller.id)}
                            disabled={rejectSellerMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredSellers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No sellers found matching the current filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seller Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Seller Details</DialogTitle>
            <DialogDescription>
              View and manage seller information
            </DialogDescription>
          </DialogHeader>
          {selectedSeller && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Personal Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedSeller.name}</div>
                    <div><span className="font-medium">Email:</span> {selectedSeller.email}</div>
                    <div><span className="font-medium">Mobile:</span> {selectedSeller.mobile}</div>
                    <div><span className="font-medium">Status:</span> {getStatusBadge(selectedSeller.status, selectedSeller.isVerifiedSeller)}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Business Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Business Name:</span> {selectedSeller.businessName || 'N/A'}</div>
                    <div><span className="font-medium">Business Phone:</span> {selectedSeller.businessPhone || 'N/A'}</div>
                    <div><span className="font-medium">Experience:</span> {selectedSeller.experienceYears ? `${selectedSeller.experienceYears} years` : 'N/A'}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Business Address</h3>
                <p className="text-sm text-gray-600">{selectedSeller.businessAddress || 'N/A'}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Skills</h3>
                <p className="text-sm text-gray-600">{selectedSeller.skills || 'N/A'}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Account Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Registered:</span> {new Date(selectedSeller.createdAt).toLocaleDateString()}</div>
                  <div><span className="font-medium">Last Updated:</span> {new Date(selectedSeller.updatedAt).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Status Update Actions */}
              {selectedSeller.status === 'pending' && (
                <div className="flex space-x-2 pt-4 border-t">
                  <Button
                    onClick={() => handleApprove(selectedSeller.id)}
                    disabled={approveSellerMutation.isPending}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Application
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selectedSeller.id)}
                    disabled={rejectSellerMutation.isPending}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Application
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}