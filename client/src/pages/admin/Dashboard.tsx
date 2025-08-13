import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Star, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  UserCheck,
  Settings
} from 'lucide-react';
import AdminNavigation from '@/components/AdminNavigation';
import { Link } from 'wouter';

export default function AdminDashboard() {
  const { data: bookings } = useQuery({
    queryKey: ['/api/bookings'],
  });

  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: services } = useQuery({
    queryKey: ['/api/services'],
  });

  const { data: promotions } = useQuery({
    queryKey: ['/api/promotions'],
  });

  // Calculate stats
  const totalBookings = bookings?.length || 0;
  const totalUsers = users?.length || 0;
  const totalServices = services?.length || 0;
  const totalRevenue = bookings?.reduce((sum: number, booking: any) => 
    sum + parseFloat(booking.totalAmount || '0'), 0) || 0;

  const pendingBookings = bookings?.filter((booking: any) => booking.status === 'pending').length || 0;
  const completedBookings = bookings?.filter((booking: any) => booking.status === 'completed').length || 0;
  const activeUsers = users?.filter((user: any) => user.role === 'user').length || 0;
  const employees = users?.filter((user: any) => user.role === 'employee').length || 0;

  const recentBookings = bookings?.slice(0, 5) || [];
  const recentUsers = users?.slice(0, 5) || [];

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

  const stats = [
    {
      title: 'Total Revenue',
      value: `${totalRevenue.toFixed(2)} QAR`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+12.5%',
      changeColor: 'text-green-600'
    },
    {
      title: 'Total Bookings',
      value: totalBookings.toString(),
      icon: Calendar,
      color: 'bg-blue-500',
      change: '+8.2%',
      changeColor: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: activeUsers.toString(),
      icon: Users,
      color: 'bg-purple-500',
      change: '+15.3%',
      changeColor: 'text-purple-600'
    },
    {
      title: 'Completion Rate',
      value: `${totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(1) : 0}%`,
      icon: CheckCircle,
      color: 'bg-orange-500',
      change: '+2.1%',
      changeColor: 'text-orange-600'
    }
  ];

  const quickActions = [
    { title: 'Manage Users', href: '/admin/users', icon: Users, color: 'bg-blue-500' },
    { title: 'Manage Services', href: '/admin/services', icon: Settings, color: 'bg-green-500' },
    { title: 'View Categories', href: '/admin/categories', icon: Star, color: 'bg-purple-500' },
    { title: 'Booking Schedule', href: '/admin/booking-schedule', icon: Calendar, color: 'bg-emerald-500' },
    { title: 'Seller Management', href: '/admin/sellers', icon: UserCheck, color: 'bg-indigo-500' },
    { title: 'Provider Applications', href: '/admin/providers', icon: UserCheck, color: 'bg-teal-500' },
    { title: 'Promotions', href: '/admin/promotions', icon: TrendingUp, color: 'bg-orange-500' },
    { title: 'Employees', href: '/admin/employees', icon: UserCheck, color: 'bg-red-500' },
    { title: 'Payment Methods', href: '/admin/payment-methods', icon: DollarSign, color: 'bg-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Admin Navigation */}
        <AdminNavigation className="mb-6" />
        
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your cleaning services platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${stat.changeColor} mt-1`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-full`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Button
                    variant="outline"
                    className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2 hover:bg-gray-50 w-full"
                  >
                    <div className={`${action.color} p-2 rounded-full`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm text-center leading-tight">{action.title}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No recent bookings</p>
                ) : (
                  recentBookings.map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{booking.service?.name}</h4>
                        <p className="text-sm text-gray-600">{booking.user?.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                        <p className="text-sm font-medium mt-1">{booking.totalAmount} QAR</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No recent users</p>
                ) : (
                  recentUsers.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{user.name}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Services</h3>
                <p className="text-sm text-gray-600">{totalServices} active services</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Employees</h3>
                <p className="text-sm text-gray-600">{employees} registered employees</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Pending</h3>
                <p className="text-sm text-gray-600">{pendingBookings} pending bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
