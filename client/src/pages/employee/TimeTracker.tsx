import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Calendar, 
  User, 
  MapPin, 
  Plus, 
  Edit,
  Timer,
  BarChart3,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const timeLogSchema = z.object({
  bookingId: z.string().min(1, 'Booking is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().optional(),
  notes: z.string().optional(),
});

export default function EmployeeTimeTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTimer, setActiveTimer] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTimeLog, setSelectedTimeLog] = useState<any>(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const { data: timeLogs, isLoading: timeLogsLoading } = useQuery({
    queryKey: ['/api/time-logs'],
    enabled: !!user,
  });

  const { data: bookings } = useQuery({
    queryKey: ['/api/bookings'],
    enabled: !!user,
    select: (data) => data?.filter((booking: any) => 
      booking.employeeId === user?.id && 
      (booking.status === 'confirmed' || booking.status === 'in_progress')
    ) || [],
  });

  const { data: invoices } = useQuery({
    queryKey: ['/api/invoices'],
    enabled: !!user,
  });

  const timeLogForm = useForm<z.infer<typeof timeLogSchema>>({
    resolver: zodResolver(timeLogSchema),
    defaultValues: {
      bookingId: '',
      startTime: '',
      endTime: '',
      notes: '',
    },
  });

  const createTimeLogMutation = useMutation({
    mutationFn: (data: z.infer<typeof timeLogSchema>) => {
      const formattedData = {
        bookingId: parseInt(data.bookingId),
        startTime: new Date(data.startTime).toISOString(),
        endTime: data.endTime ? new Date(data.endTime).toISOString() : null,
        notes: data.notes,
      };
      return apiRequest('POST', '/api/time-logs', formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-logs'] });
      setIsCreateModalOpen(false);
      timeLogForm.reset();
      toast({
        title: "Time log created",
        description: "Time log has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error.message || "Failed to create time log.",
        variant: "destructive",
      });
    },
  });

  const updateTimeLogMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<any> }) =>
      apiRequest('PUT', `/api/time-logs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-logs'] });
      setActiveTimer(null);
      setIsEditModalOpen(false);
      setSelectedTimeLog(null);
      toast({
        title: "Time log updated",
        description: "Time log has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update time log.",
        variant: "destructive",
      });
    },
  });

  const startTimer = async (bookingId: number) => {
    try {
      const response = await apiRequest('POST', '/api/time-logs', {
        bookingId,
        startTime: new Date().toISOString(),
      });
      const newTimeLog = await response.json();
      setActiveTimer(newTimeLog);
      queryClient.invalidateQueries({ queryKey: ['/api/time-logs'] });
      toast({
        title: "Timer started",
        description: "Time tracking has been started for this booking.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to start timer",
        description: error.message || "Could not start the timer.",
        variant: "destructive",
      });
    }
  };

  const stopTimer = () => {
    if (activeTimer) {
      updateTimeLogMutation.mutate({
        id: activeTimer.id,
        data: { endTime: new Date().toISOString() }
      });
    }
  };

  const handleCreateTimeLog = (data: z.infer<typeof timeLogSchema>) => {
    createTimeLogMutation.mutate(data);
  };

  const handleEditTimeLog = (timeLog: any) => {
    setSelectedTimeLog(timeLog);
    timeLogForm.reset({
      bookingId: timeLog.bookingId.toString(),
      startTime: new Date(timeLog.startTime).toISOString().slice(0, 16),
      endTime: timeLog.endTime ? new Date(timeLog.endTime).toISOString().slice(0, 16) : '',
      notes: timeLog.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTimeLog = (data: z.infer<typeof timeLogSchema>) => {
    if (selectedTimeLog) {
      const formattedData = {
        bookingId: parseInt(data.bookingId),
        startTime: new Date(data.startTime).toISOString(),
        endTime: data.endTime ? new Date(data.endTime).toISOString() : null,
        notes: data.notes,
      };
      updateTimeLogMutation.mutate({ id: selectedTimeLog.id, data: formattedData });
    }
  };

  // Find active timer from existing time logs
  useEffect(() => {
    if (timeLogs && !activeTimer) {
      const activeLog = timeLogs.find((log: any) => !log.endTime);
      if (activeLog) {
        setActiveTimer(activeLog);
      }
    }
  }, [timeLogs, activeTimer]);

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : currentTime;
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTotalHours = () => {
    if (!timeLogs) return 0;
    return timeLogs.reduce((total: number, log: any) => {
      if (log.endTime) {
        const start = new Date(log.startTime);
        const end = new Date(log.endTime);
        return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }
      return total;
    }, 0);
  };

  const getThisWeekHours = () => {
    if (!timeLogs) return 0;
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    
    return timeLogs.reduce((total: number, log: any) => {
      const logDate = new Date(log.startTime);
      if (logDate >= weekStart && log.endTime) {
        const start = new Date(log.startTime);
        const end = new Date(log.endTime);
        return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }
      return total;
    }, 0);
  };

  const getThisMonthEarnings = () => {
    if (!invoices) return 0;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return invoices.reduce((total: number, invoice: any) => {
      const invoiceDate = new Date(invoice.createdAt);
      if (invoiceDate >= monthStart) {
        return total + parseFloat(invoice.totalAmount || '0');
      }
      return total;
    }, 0);
  };

  const recentLogs = timeLogs?.slice(0, 5) || [];

  if (timeLogsLoading) {
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

  if (!user || user.role !== 'employee') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to employees.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Time Tracker</h1>
          <p className="text-gray-600">Track your working hours and manage time logs</p>
        </div>

        {/* Active Timer Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Timer className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {activeTimer ? 'Timer Running' : 'No Active Timer'}
                  </h3>
                  {activeTimer ? (
                    <div className="space-y-1">
                      <p className="text-3xl font-mono font-bold text-primary">
                        {formatDuration(activeTimer.startTime)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Started at {new Date(activeTimer.startTime).toLocaleTimeString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-600">Select a booking to start tracking time</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {activeTimer ? (
                  <Button
                    onClick={stopTimer}
                    disabled={updateTimeLogMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                  >
                    <Square className="w-4 h-4" />
                    {updateTimeLogMutation.isPending ? 'Stopping...' : 'Stop Timer'}
                  </Button>
                ) : (
                  bookings?.length > 0 && (
                    <Select onValueChange={(value) => startTimer(parseInt(value))}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select booking to start timer" />
                      </SelectTrigger>
                      <SelectContent>
                        {bookings?.map((booking: any) => (
                          <SelectItem key={booking.id} value={booking.id.toString()}>
                            <div className="flex flex-col">
                              <span>{booking.service?.name}</span>
                              <span className="text-xs text-gray-500">
                                {booking.user?.name} - {booking.city}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )
                )}
                
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Manual Entry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-primary mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Hours</p>
                  <p className="text-2xl font-bold">{getTotalHours().toFixed(1)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold">{getThisWeekHours().toFixed(1)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Logs</p>
                  <p className="text-2xl font-bold">{timeLogs?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-orange-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold">{getThisMonthEarnings().toFixed(0)} QAR</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Time Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">No time logs found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Start tracking time for your bookings
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentLogs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{log.booking?.service?.name}</p>
                            <p className="text-sm text-gray-600">{log.booking?.city}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{log.booking?.user?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(log.startTime).toLocaleDateString()}
                            <br />
                            <span className="text-gray-600">
                              {new Date(log.startTime).toLocaleTimeString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.endTime ? (
                            <div className="text-sm">
                              {new Date(log.endTime).toLocaleDateString()}
                              <br />
                              <span className="text-gray-600">
                                {new Date(log.endTime).toLocaleTimeString()}
                              </span>
                            </div>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">
                              Running
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono font-medium">
                            {formatDuration(log.startTime, log.endTime)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-600 max-w-xs line-clamp-2">
                            {log.notes || 'No notes'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTimeLog(log)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Create Time Log Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manual Time Entry</DialogTitle>
            </DialogHeader>
            
            <Form {...timeLogForm}>
              <form onSubmit={timeLogForm.handleSubmit(handleCreateTimeLog)} className="space-y-4">
                <FormField
                  control={timeLogForm.control}
                  name="bookingId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Booking</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select booking" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bookings?.map((booking: any) => (
                            <SelectItem key={booking.id} value={booking.id.toString()}>
                              <div className="flex flex-col">
                                <span>{booking.service?.name}</span>
                                <span className="text-xs text-gray-500">
                                  {booking.user?.name} - {booking.city}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={timeLogForm.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={timeLogForm.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time (Optional)</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={timeLogForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Add any notes about this work session..." {...field} />
                      </FormControl>
                      <FormMessage />
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
                    disabled={createTimeLogMutation.isPending}
                    className="btn-primary"
                  >
                    {createTimeLogMutation.isPending ? 'Creating...' : 'Create Time Log'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Time Log Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Time Log</DialogTitle>
            </DialogHeader>
            
            <Form {...timeLogForm}>
              <form onSubmit={timeLogForm.handleSubmit(handleUpdateTimeLog)} className="space-y-4">
                <FormField
                  control={timeLogForm.control}
                  name="bookingId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Booking</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bookings?.map((booking: any) => (
                            <SelectItem key={booking.id} value={booking.id.toString()}>
                              <div className="flex flex-col">
                                <span>{booking.service?.name}</span>
                                <span className="text-xs text-gray-500">
                                  {booking.user?.name} - {booking.city}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={timeLogForm.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={timeLogForm.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={timeLogForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
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
                    disabled={updateTimeLogMutation.isPending}
                    className="btn-primary"
                  >
                    {updateTimeLogMutation.isPending ? 'Updating...' : 'Update Time Log'}
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
