import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/useAuth";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import ServiceDetails from "@/pages/ServiceDetails";
import Profile from "@/pages/Profile";
import Bookings from "@/pages/Bookings";
import Favorites from "@/pages/Favorites";
import Cart from "@/pages/Cart";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminServices from "@/pages/admin/Services";
import AdminCategories from "@/pages/admin/Categories";
import AdminEmployees from "@/pages/admin/Employees";
import AdminPromotions from "@/pages/admin/Promotions";
import AdminPaymentMethods from "@/pages/admin/PaymentMethods";
import EmployeeTimeTracker from "@/pages/employee/TimeTracker";
import About from "@/pages/About";
import Contact from "@/pages/Contact";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/services/:id" component={ServiceDetails} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      
      <Route path="/bookings">
        <ProtectedRoute>
          <Bookings />
        </ProtectedRoute>
      </Route>
      
      <Route path="/favorites">
        <ProtectedRoute>
          <Favorites />
        </ProtectedRoute>
      </Route>
      
      <Route path="/cart">
        <ProtectedRoute>
          <Cart />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/dashboard">
        <ProtectedRoute roles={['admin', 'superadmin']}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/users">
        <ProtectedRoute roles={['admin', 'superadmin']}>
          <AdminUsers />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/services">
        <ProtectedRoute roles={['admin', 'superadmin']}>
          <AdminServices />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/categories">
        <ProtectedRoute roles={['admin', 'superadmin']}>
          <AdminCategories />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/employees">
        <ProtectedRoute roles={['admin', 'superadmin']}>
          <AdminEmployees />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/promotions">
        <ProtectedRoute roles={['admin', 'superadmin']}>
          <AdminPromotions />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/payment-methods">
        <ProtectedRoute roles={['admin', 'superadmin']}>
          <AdminPaymentMethods />
        </ProtectedRoute>
      </Route>
      
      <Route path="/employee/time-tracker">
        <ProtectedRoute roles={['employee']}>
          <EmployeeTimeTracker />
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Layout>
            <Router />
          </Layout>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
