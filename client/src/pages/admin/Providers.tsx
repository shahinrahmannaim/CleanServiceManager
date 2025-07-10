import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { User, CheckCircle, XCircle, Clock, Building, Phone, Mail, Award } from 'lucide-react';

interface Provider {
  id: number;
  name: string;
  email: string;
  mobile: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  experienceYears: number;
  skills: string;
  status: 'pending' | 'active' | 'rejected';
  createdAt: string;
}

export default function Providers() {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingProviders = [], isLoading } = useQuery({
    queryKey: ['/api/providers/pending'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/providers/pending');
      return response.json();
    },
  });

  const approveProviderMutation = useMutation({
    mutationFn: async ({ providerId, approved }: { providerId: number; approved: boolean }) => {
      const response = await apiRequest('PUT', `/api/providers/${providerId}/approve`, { approved });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/providers/pending'] });
      toast({
        title: variables.approved ? "Provider Approved" : "Provider Rejected",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update provider status",
        variant: "destructive",
      });
    },
  });

  const handleApproveProvider = (providerId: number, approved: boolean) => {
    approveProviderMutation.mutate({ providerId, approved });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading provider applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Provider Applications</h1>
          <p className="text-gray-600">Review and manage service provider applications</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            {pendingProviders.length} Pending
          </Badge>
        </div>
      </div>

      {pendingProviders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Applications</h3>
            <p className="text-gray-600">All provider applications have been reviewed.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pending Provider Applications</CardTitle>
            <CardDescription>
              Review and approve or reject service provider applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider Info</TableHead>
                  <TableHead>Business Details</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingProviders.map((provider: Provider) => (
                  <TableRow key={provider.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900">{provider.name}</div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-3 h-3 mr-1" />
                          {provider.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-3 h-3 mr-1" />
                          {provider.mobile}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Building className="w-3 h-3 mr-1" />
                          <span className="font-medium">{provider.businessName}</span>
                        </div>
                        <div className="text-sm text-gray-600">{provider.businessAddress}</div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-3 h-3 mr-1" />
                          {provider.businessPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Award className="w-3 h-3 mr-1" />
                          <span className="font-medium">{provider.experienceYears} years</span>
                        </div>
                        <div className="text-sm text-gray-600 max-w-xs truncate" title={provider.skills}>
                          {provider.skills}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {new Date(provider.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(provider.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedProvider(provider)}
                        >
                          View Details
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Approve Provider Application</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to approve {provider.name}'s application? 
                                They will be able to offer services on the platform.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleApproveProvider(provider.id, true)}
                                disabled={approveProviderMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {approveProviderMutation.isPending ? 'Approving...' : 'Approve'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reject Provider Application</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to reject {provider.name}'s application? 
                                This action cannot be easily undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleApproveProvider(provider.id, false)}
                                disabled={approveProviderMutation.isPending}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {approveProviderMutation.isPending ? 'Rejecting...' : 'Reject'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Provider Details Modal */}
      {selectedProvider && (
        <AlertDialog open={!!selectedProvider} onOpenChange={() => setSelectedProvider(null)}>
          <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Provider Application Details</AlertDialogTitle>
              <AlertDialogDescription>
                Complete information for {selectedProvider.name}'s provider application
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Name:</span> {selectedProvider.name}</div>
                    <div><span className="text-gray-600">Email:</span> {selectedProvider.email}</div>
                    <div><span className="text-gray-600">Mobile:</span> {selectedProvider.mobile}</div>
                    <div><span className="text-gray-600">Applied:</span> {new Date(selectedProvider.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Business Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Business Name:</span> {selectedProvider.businessName}</div>
                    <div><span className="text-gray-600">Business Phone:</span> {selectedProvider.businessPhone}</div>
                    <div><span className="text-gray-600">Experience:</span> {selectedProvider.experienceYears} years</div>
                    <div><span className="text-gray-600">Status:</span> {getStatusBadge(selectedProvider.status)}</div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Business Address</h4>
                <p className="text-sm text-gray-600">{selectedProvider.businessAddress}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Skills & Services</h4>
                <p className="text-sm text-gray-600">{selectedProvider.skills}</p>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleApproveProvider(selectedProvider.id, true)}
                disabled={approveProviderMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve Application
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}