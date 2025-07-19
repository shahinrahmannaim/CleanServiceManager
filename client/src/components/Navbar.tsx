import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Heart, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Search, 
  Shield, 
  ChevronDown,
  LogOut 
} from 'lucide-react';
import AuthModal from './AuthModal';
import { logout } from '../lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function Navbar() {
  const [location, navigate] = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, setUser } = useAuth();
  const { toast } = useToast();

  const { data: cartCount } = useQuery({
    queryKey: ['/api/cart'],
    enabled: !!user,
  });

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate('/');
      toast({
        title: "Goodbye!",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact Us' },
  ];

  return (
    <>
      {/* Top Contact Bar */}
      <div className="bg-gradient-to-r from-red-500 via-red-600 to-blue-900 text-white py-2 text-sm relative overflow-hidden">
        {/* Background overlay with tomato to navy gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/95 via-red-600/90 to-blue-900/95"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              <span>+974 4444 5555</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              <span>info@panaroma.qa</span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-3">
            <Facebook className="h-4 w-4 hover:text-blue-300 cursor-pointer transition-colors" />
            <Twitter className="h-4 w-4 hover:text-blue-300 cursor-pointer transition-colors" />
            <Linkedin className="h-4 w-4 hover:text-blue-300 cursor-pointer transition-colors" />
            <Instagram className="h-4 w-4 hover:text-blue-300 cursor-pointer transition-colors" />
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav 
        className="shadow-lg sticky top-0 z-50 border-b-2 border-red-500"
        style={{
          background: `linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(239, 68, 68, 0.95) 100%)`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-28">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img 
                src="/panaroma-logo.png" 
                alt="Panaroma Facilities Management" 
                className="h-24 w-auto object-contain hover:scale-105 transition-transform duration-200"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-white font-medium transition-all duration-200 hover:text-blue-200 hover:scale-105 px-3 py-2 rounded-md ${
                    location === item.href ? "text-blue-200 font-bold bg-blue-800/50 backdrop-blur-sm" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Search and Auth */}
            <div className="hidden md:flex items-center space-x-4">
              {user && (
                <>
                  <Link href="/favorites">
                    <Button variant="ghost" size="sm" className="text-white hover:text-blue-200 hover:bg-blue-800/50">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/cart">
                    <Button variant="ghost" size="sm" className="relative text-white hover:text-blue-200 hover:bg-blue-800/50">
                      <ShoppingCart className="h-4 w-4" />
                      {cartCount && cartCount.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-yellow-500 text-blue-900 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {cartCount.length}
                        </span>
                      )}
                    </Button>
                  </Link>
                </>
              )}

              <Link href="/services">
                <Button variant="ghost" size="sm" className="text-white hover:text-blue-200 hover:bg-blue-800/50">
                  <Search className="h-4 w-4" />
                </Button>
              </Link>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 text-white hover:text-blue-200 hover:bg-blue-800/50">
                      <User className="h-5 w-5" />
                      <span>{user.name}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/bookings')}>
                      <User className="h-4 w-4 mr-2" />
                      My Bookings
                    </DropdownMenuItem>
                    {(user.role === 'admin' || user.role === 'superadmin') && (
                      <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    {user.role === 'employee' && (
                      <DropdownMenuItem onClick={() => navigate('/employee/time-tracker')}>
                        <Shield className="h-4 w-4 mr-2" />
                        Employee Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-white text-blue-800 hover:bg-blue-50 border border-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="ghost"
                size="sm"
                className="text-white hover:text-blue-200 hover:bg-blue-800/50"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-blue-800 border-t border-blue-700">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                      location === item.href
                        ? "text-blue-200 bg-blue-900/50 font-bold"
                        : "text-white hover:text-blue-200 hover:bg-blue-700/50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                
                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t border-blue-700">
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center px-3 py-2">
                        <User className="h-5 w-5 mr-2 text-white" />
                        <span className="text-sm font-medium text-white">{user.name}</span>
                      </div>
                      <Button
                        onClick={() => {
                          navigate('/profile');
                          setIsMobileMenuOpen(false);
                        }}
                        variant="ghost"
                        className="w-full justify-start text-white hover:text-blue-200 hover:bg-blue-700/50"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Button>
                      <Button
                        onClick={() => {
                          navigate('/bookings');
                          setIsMobileMenuOpen(false);
                        }}
                        variant="ghost"
                        className="w-full justify-start text-white hover:text-blue-200 hover:bg-blue-700/50"
                      >
                        <User className="h-4 w-4 mr-2" />
                        My Bookings
                      </Button>
                      {user && (
                        <>
                          <Button
                            onClick={() => {
                              navigate('/favorites');
                              setIsMobileMenuOpen(false);
                            }}
                            variant="ghost"
                            className="w-full justify-start text-white hover:text-blue-200 hover:bg-blue-700/50"
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            Favorites
                          </Button>
                          <Button
                            onClick={() => {
                              navigate('/cart');
                              setIsMobileMenuOpen(false);
                            }}
                            variant="ghost"
                            className="w-full justify-start text-white hover:text-blue-200 hover:bg-blue-700/50"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Cart {cartCount && cartCount.length > 0 && `(${cartCount.length})`}
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        variant="ghost"
                        className="w-full justify-start text-red-300 hover:text-red-200 hover:bg-blue-700/50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-white text-blue-800 hover:bg-blue-50 py-2 rounded-lg font-medium"
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}