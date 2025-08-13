import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  UserCheck,
  AlertCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import AdminNavigation from '@/components/AdminNavigation';
import { useToast } from '@/hooks/use-toast';

export default function AdminEmployees() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/users'],
    select: (data) => data?.filter((user: any) => user.role === 'employee') || [],
  });

  const { data: timeLogs } = useQuery({
    queryKey: ['/api/time-logs'],
  });

  const { data: bookings } = useQuery({
    queryKey: ['/api/bookings'],
  });

  const { data: invoices } = useQuery({
    queryKey: ['/api/invoices'],
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest('PUT', `/api/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Employee updated",
        description: "Employee status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update employee.",
        variant: "destructive",
      });
    },
  });

  const handleApproveEmployee = (employeeId: number) => {
    updateEmployeeMutation.mutate({
      id: employeeId,
      data: { isVerifiedProvider: true }
    });
  };

  const handleRejectEmployee = (employeeId: number) => {
    updateEmployeeMutation.mutate({
      id: employeeId,
      data: { isVerifiedProvider: false }
    });
  };

  const handleViewDetails = (employee: any) => {
    setSelectedEmployee(employee);
    setIsDetailsModalOpen(true);
  };

  const getStatusColor = (isVerified: boolean) => {
    return isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const filteredEmployees = employees?.filter((employee: any) => {
    const matchesSearch = !searchQuery || 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.mobile.includes(searchQuery);
    
    return matchesSearch;
  }) || [];

  const verifiedEmployees = filteredEmployees.filter((emp: any) => emp.isVerifiedProvider);
  const pendingEmployees = filteredEmployees.filter((emp: any) => !emp.isVerifiedProvider);

  const getEmployeeStats = (employeeId: number) => {
    const empBookings = bookings?.filter((booking: any) => booking.employeeId === employeeId) || [];
    const empTimeLogs = timeLogs?.filter((log: any) => log.employeeId === employeeId) || [];
    const empInvoices = invoices?.filter((invoice: any) => invoice.employeeId === employeeId) || [];
    
    const totalBookings = empBookings.length;
    const completedBookings = empBookings.filter((b: any) => b.status === 'completed').length;
    const totalHours = empTimeLogs.reduce((sum: number, log: any) => {
      if (log.endTime) {
        const start = new Date(log.startTime);
        const end = new Date(log.endTime);
        return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }
      return sum;
    }, 0);
    const totalEarnings = empInvoices.reduce((sum: number, invoice: any) => 
      sum + parseFloat(invoice.totalAmount || '0'), 0);

    return {
      totalBookings,
      completedBookings,
      totalHours: totalHours.toFixed(1),
      totalEarnings: totalEarnings.toFixed(2),
    };
  };

  if (employeesLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Management</h1>
          <p className="text-gray-600">Manage service providers and track their performance</p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employees by name, email, or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Employee Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold">{employees?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Verified</p>
                  <p className="text-2xl font-bold">{verifiedEmployees.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold">{pendingEmployees.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Active This Month</p>
                  <p className="text-2xl font-bold">
                    {timeLogs?.filter((log: any) => {
                      const logDate = new Date(log.createdAt);
                      const now = new Date();
                      return logDate.getMonth() === now.getMonth() && 
                             logDate.getFullYear() === now.getFullYear();
                    }).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employees Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Employees ({filteredEmployees.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All ({filteredEmployees.length})</TabsTrigger>
                <TabsTrigger value="verified">Verified ({verifiedEmployees.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingEmployees.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <EmployeeTable 
                  employees={filteredEmployees} 
                  onViewDetails={handleViewDetails}
                  onApprove={handleApproveEmployee}
                  onReject={handleRejectEmployee}
                  getEmployeeStats={getEmployeeStats}
                />
              </TabsContent>

              <TabsContent value="verified">
                <EmployeeTable 
                  employees={verifiedEmployees} 
                  onViewDetails={handleViewDetails}
                  onApprove={handleApproveEmployee}
                  onReject={handleRejectEmployee}
                  getEmployeeStats={getEmployeeStats}
                />
              </TabsContent>

              <TabsContent value="pending">
                <EmployeeTable 
                  employees={pendingEmployees} 
                  onViewDetails={handleViewDetails}
                  onApprove={handleApproveEmployee}
                  onReject={handleRejectEmployee}
                  getEmployeeStats={getEmployeeStats}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Employee Details Modal */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Employee Details</DialogTitle>
            </DialogHeader>
            
            {selectedEmployee && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-medium">
                      {selectedEmployee.name.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedEmployee.name}</h3>
                    <p className="text-gray-600">{selectedEmployee.email}</p>
                    <Badge className={getStatusColor(selectedEmployee.isVerifiedProvider)}>
                      {selectedEmployee.isVerifiedProvider ? 'Verified Provider' : 'Pending Verification'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{selectedEmployee.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{selectedEmployee.mobile}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <span>Joined {new Date(selectedEmployee.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Performance Stats</h4>
                    <div className="space-y-2 text-sm">
                      {(() => {
                        const stats = getEmployeeStats(selectedEmployee.id);
                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <span>Total Bookings:</span>
                              <span className="font-medium">{stats.totalBookings}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Completed:</span>
                              <span className="font-medium">{stats.completedBookings}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Total Hours:</span>
                              <span className="font-medium">{stats.totalHours}h</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Total Earnings:</span>
                              <span className="font-medium">{stats.totalEarnings} QAR</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  {!selectedEmployee.isVerifiedProvider && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleRejectEmployee(selectedEmployee.id);
                          setIsDetailsModalOpen(false);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        Reject
                      </Button>
                      <Button
                        onClick={() => {
                          handleApproveEmployee(selectedEmployee.id);
                          setIsDetailsModalOpen(false);
                        }}
                        className="btn-primary"
                      >
                        Approve
                      </Button>
                    </>
                  )}
                  <Button onClick={() => setIsDetailsModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function EmployeeTable({ 
  employees, 
  onViewDetails, 
  onApprove, 
  onReject, 
  getEmployeeStats 
}: { 
  employees: any[], 
  onViewDetails: (employee: any) => void,
  onApprove: (id: number) => void,
  onReject: (id: number) => void,
  getEmployeeStats: (id: number) => any,
}) {
  const getStatusColor = (isVerified: boolean) => {
    return isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  if (employees.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">No employees found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Performance</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee: any) => {
            const stats = getEmployeeStats(employee.id);
            return (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {employee.name.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-gray-600">{employee.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {employee.email}
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {employee.mobile}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(employee.isVerifiedProvider)}>
                    {employee.isVerifiedProvider ? 'Verified' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm">
                    <div>{stats.totalBookings} bookings</div>
                    <div className="text-gray-500">{stats.totalHours}h worked</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(employee.createdAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(employee)}
                    >
                      View Details
                    </Button>
                    {!employee.isVerifiedProvider && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => onApprove(employee.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onReject(employee.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
