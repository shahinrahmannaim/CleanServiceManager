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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Calendar,
  Clock,
  User,
  Download,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Edit,
  MapPin,
  Phone,
  Eye,
  CalendarDays,
  Users,
  DollarSign,
  Activity
} from 'lucide-react';
import AdminNavigation from '@/components/AdminNavigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Booking {
  id: number;
  userId: number;
  serviceId: number;
  employeeId?: number;
  address: string;
  city: string;
  scheduledDate: string;
  status: string;
  totalAmount: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
    mobile: string;
  };
  service?: {
    name: string;
    description: string;
    price: string;
  };
  employee?: {
    name: string;
    email: string;
    mobile: string;
  };
}

interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
}

export default function BookingSchedule() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEmployeeAssignOpen, setIsEmployeeAssignOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch bookings data
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['/api/bookings'],
    queryFn: () => apiRequest('/api/bookings'),
  });

  // Fetch employees for assignment
  const { data: employees = [] } = useQuery({
    queryKey: ['/api/users', 'employee'],
    queryFn: () => apiRequest('/api/users?role=employee'),
  });

  // Fetch booking statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/bookings/stats'],
    queryFn: () => apiRequest('/api/bookings/stats'),
  });

  // Update booking mutation
  const updateBookingMutation = useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: number; data: any }) => 
      apiRequest(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Booking updated",
        description: "Booking has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/stats'] });
      setIsEmployeeAssignOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking",
        variant: "destructive",
      });
    },
  });

  // Auto-assign employee mutation
  const autoAssignMutation = useMutation({
    mutationFn: (bookingId: number) => 
      apiRequest(`/api/bookings/${bookingId}/auto-assign`, {
        method: 'POST',
      }),
    onSuccess: () => {
      toast({
        title: "Employee assigned",
        description: "Employee has been automatically assigned to the booking.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to auto-assign employee",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  const handleEmployeeAssign = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsEmployeeAssignOpen(true);
  };

  const handleAssignEmployee = (employeeId: number) => {
    if (selectedBooking) {
      updateBookingMutation.mutate({
        bookingId: selectedBooking.id,
        data: { employeeId, status: 'confirmed' }
      });
    }
  };

  const handleStatusChange = (bookingId: number, status: string) => {
    updateBookingMutation.mutate({
      bookingId,
      data: { status }
    });
  };

  const handleAutoAssign = (bookingId: number) => {
    autoAssignMutation.mutate(bookingId);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'outline', className: 'bg-yellow-50 text-yellow-800 border-yellow-300' },
      confirmed: { variant: 'default', className: 'bg-blue-50 text-blue-800 border-blue-300' },
      in_progress: { variant: 'default', className: 'bg-purple-50 text-purple-800 border-purple-300' },
      completed: { variant: 'default', className: 'bg-green-50 text-green-800 border-green-300' },
      cancelled: { variant: 'destructive', className: '' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant as any} className={config.className}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('Booking Schedule Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Total Bookings: ${filteredBookings.length}`, 20, 40);
    
    // Prepare table data
    const tableData = filteredBookings.map((booking: Booking) => [
      booking.id,
      booking.user?.name || 'N/A',
      booking.service?.name || 'N/A',
      booking.employee?.name || 'Unassigned',
      new Date(booking.scheduledDate).toLocaleDateString(),
      booking.status.replace('_', ' ').toUpperCase(),
      `QAR ${booking.totalAmount}`,
      booking.city
    ]);

    // Add table
    autoTable(doc, {
      head: [['ID', 'Customer', 'Service', 'Employee', 'Date', 'Status', 'Amount', 'City']],
      body: tableData,
      startY: 50,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    // Save the PDF
    doc.save(`booking-schedule-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "PDF Downloaded",
      description: "Booking schedule has been exported to PDF successfully.",
    });
  };

  const filteredBookings = bookings.filter((booking: Booking) => {
    const matchesSearch = booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    const matchesDate = !dateFilter || 
                       new Date(booking.scheduledDate).toISOString().split('T')[0] === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading booking schedule...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Navigation */}
      <AdminNavigation />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Schedule Management</h1>
          <p className="text-gray-600 mt-1">Manage bookings, assign employees, and download reports</p>
        </div>
        <Button onClick={generatePDF} className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.confirmedBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.cancelledBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">QAR {stats.totalRevenue}</div>
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
                  placeholder="Search by customer, service, employee, or city..."
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
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:w-48">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Filter by date"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking: Booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">#{booking.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{booking.user?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{booking.user?.mobile || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{booking.service?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">QAR {booking.service?.price || booking.totalAmount}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {booking.employee ? (
                      <div>
                        <div className="font-medium">{booking.employee.name}</div>
                        <div className="text-sm text-gray-500">{booking.employee.mobile}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Unassigned</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{new Date(booking.scheduledDate).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">{new Date(booking.scheduledDate).toLocaleTimeString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{booking.city}</div>
                      <div className="text-sm text-gray-500">{booking.address.substring(0, 30)}...</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(booking.status)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">QAR {booking.totalAmount}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(booking)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!booking.employeeId && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEmployeeAssign(booking)}
                          >
                            <User className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAutoAssign(booking.id)}
                            disabled={autoAssignMutation.isPending}
                          >
                            Auto
                          </Button>
                        </>
                      )}
                      <Select onValueChange={(status) => handleStatusChange(booking.id, status)}>
                        <SelectTrigger className="w-24 h-8">
                          <Edit className="h-4 w-4" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredBookings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No bookings found matching the current filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              View complete booking information
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedBooking.user?.name || 'N/A'}</div>
                    <div><span className="font-medium">Email:</span> {selectedBooking.user?.email || 'N/A'}</div>
                    <div><span className="font-medium">Phone:</span> {selectedBooking.user?.mobile || 'N/A'}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Service Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Service:</span> {selectedBooking.service?.name || 'N/A'}</div>
                    <div><span className="font-medium">Price:</span> QAR {selectedBooking.service?.price || selectedBooking.totalAmount}</div>
                    <div><span className="font-medium">Status:</span> {getStatusBadge(selectedBooking.status)}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Booking Details</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Scheduled Date:</span> {new Date(selectedBooking.scheduledDate).toLocaleString()}</div>
                  <div><span className="font-medium">City:</span> {selectedBooking.city}</div>
                  <div><span className="font-medium">Address:</span> {selectedBooking.address}</div>
                  <div><span className="font-medium">Total Amount:</span> QAR {selectedBooking.totalAmount}</div>
                </div>
              </div>

              {selectedBooking.employee && (
                <div>
                  <h3 className="font-semibold mb-2">Assigned Employee</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedBooking.employee.name}</div>
                    <div><span className="font-medium">Email:</span> {selectedBooking.employee.email}</div>
                    <div><span className="font-medium">Phone:</span> {selectedBooking.employee.mobile}</div>
                  </div>
                </div>
              )}
              
              {selectedBooking.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-gray-600">{selectedBooking.notes}</p>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold mb-2">Booking Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Created:</span> {new Date(selectedBooking.createdAt).toLocaleString()}</div>
                  <div><span className="font-medium">Last Updated:</span> {new Date(selectedBooking.updatedAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Employee Assignment Dialog */}
      <Dialog open={isEmployeeAssignOpen} onOpenChange={setIsEmployeeAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Employee</DialogTitle>
            <DialogDescription>
              Select an employee to assign to this booking
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {employees.map((employee: any) => (
              <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{employee.name}</div>
                  <div className="text-sm text-gray-500">{employee.email}</div>
                  <div className="text-sm text-gray-500">{employee.mobile}</div>
                </div>
                <Button
                  onClick={() => handleAssignEmployee(employee.id)}
                  disabled={updateBookingMutation.isPending}
                >
                  Assign
                </Button>
              </div>
            ))}
            {employees.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No employees available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}