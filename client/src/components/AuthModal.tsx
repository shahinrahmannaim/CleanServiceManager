import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { login, register, sendOtp, verifyOtp } from '../lib/auth';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import { FaGoogle, FaFacebook } from 'react-icons/fa';

// Security validation functions
const validateNoSQLInjection = (value: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+['"][\w\s]*['"])/i,
    /(--|\/\*|\*\/)/,
    /('|(\\')|('')|(\-\-)|(\;)|(\|)|(\*)|(\%)|(\<)|(\>)|(\()|(\))|(\[)|(\])|(\{)|(\}))/
  ];
  
  return !sqlPatterns.some(pattern => pattern.test(value));
};

const validateNoScriptInjection = (value: string): boolean => {
  const scriptPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi,
    /eval\s*\(/gi,
    /alert\s*\(/gi,
    /confirm\s*\(/gi,
    /prompt\s*\(/gi,
    /document\.cookie/gi,
    /document\.write/gi,
    /window\.location/gi,
    /\.innerHTML/gi,
    /\.outerHTML/gi
  ];
  
  return !scriptPatterns.some(pattern => pattern.test(value));
};

const loginSchema = z.object({
  identifier: z.string()
    .min(1, 'Email or mobile is required')
    .max(255, 'Email/mobile must be less than 255 characters')
    .regex(/^[a-zA-Z0-9@._+-]+$/, 'Email/mobile contains invalid characters')
    .refine(validateNoSQLInjection, 'Invalid characters detected')
    .refine(validateNoScriptInjection, 'Invalid characters detected'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&.#_-]+$/, 'Password must contain at least one letter and one number')
    .refine(validateNoSQLInjection, 'Invalid characters detected')
    .refine(validateNoScriptInjection, 'Invalid characters detected'),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .refine(validateNoSQLInjection, 'Invalid characters detected')
    .refine(validateNoScriptInjection, 'Invalid characters detected'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format')
    .refine(validateNoSQLInjection, 'Invalid characters detected')
    .refine(validateNoScriptInjection, 'Invalid characters detected'),
  mobile: z.string()
    .min(8, 'Mobile number must be at least 8 digits')
    .max(15, 'Mobile number must be less than 15 digits')
    .regex(/^\+?[1-9]\d{7,14}$/, 'Please enter a valid mobile number')
    .refine(validateNoSQLInjection, 'Invalid characters detected')
    .refine(validateNoScriptInjection, 'Invalid characters detected'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&.#_-]+$/, 'Password must contain at least one letter and one number')
    .refine(validateNoSQLInjection, 'Invalid characters detected')
    .refine(validateNoScriptInjection, 'Invalid characters detected'),
  confirmPassword: z.string()
    .min(8, 'Confirm password is required')
    .max(128, 'Password must be less than 128 characters'),

  rememberMe: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});



const otpSchema = z.object({
  identifier: z.string()
    .min(1, 'Email or mobile is required')
    .max(255, 'Email/mobile must be less than 255 characters')
    .regex(/^[a-zA-Z0-9@._+-]+$/, 'Email/mobile contains invalid characters')
    .refine(validateNoSQLInjection, 'Invalid characters detected')
    .refine(validateNoScriptInjection, 'Invalid characters detected'),
  type: z.enum(['email', 'mobile']),
  code: z.string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers'),
});

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'otp'>('login');
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [otpType, setOtpType] = useState<'email' | 'mobile'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setUser, refetch } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false,
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
      rememberMe: false,
    },
  });



  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      identifier: '',
      type: 'email',
      code: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: ({ identifier, password }: { identifier: string; password: string }) =>
      login(identifier, password),
    onSuccess: (data) => {
      try {
        setUser(data.user);
        handleClose();
        toast({
          title: "Login successful",
          description: `Welcome back, ${data.user.name}!`,
        });
      } catch (error) {
        console.error('Login success handler error:', error);
        toast({
          title: "Login warning",
          description: "Login successful but there was an issue with the interface",
          variant: "default",
        });
      }
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "Please check your email for verification.",
      });
      setMode('login');
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Registration failed",
        variant: "destructive",
      });
    },
  });



  const sendOtpMutation = useMutation({
    mutationFn: ({ identifier, type }: { identifier: string; type: 'email' | 'mobile' }) =>
      sendOtp(identifier, type),
    onSuccess: () => {
      toast({
        title: "OTP sent",
        description: "Please check your email/mobile for the OTP code.",
      });
      otpForm.setValue('identifier', otpIdentifier);
      otpForm.setValue('type', otpType);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send OTP",
        description: error.message || "Could not send OTP",
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: ({ identifier, type, code }: { identifier: string; type: 'email' | 'mobile'; code: string }) =>
      verifyOtp(identifier, type, code),
    onSuccess: () => {
      toast({
        title: "OTP verified",
        description: "Your account has been verified successfully.",
      });
      refetch();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "OTP verification failed",
        description: error.message || "Invalid OTP",
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(data);
  };



  const onOtpSubmit = (data: z.infer<typeof otpSchema>) => {
    verifyOtpMutation.mutate(data);
  };

  const handleSendOtp = () => {
    if (!otpIdentifier) return;
    sendOtpMutation.mutate({ identifier: otpIdentifier, type: otpType });
  };

  const handleClose = () => {
    try {
      setMode('login');
      loginForm.reset();
      registerForm.reset();
      otpForm.reset();
      setOtpIdentifier('');
      onClose();
    } catch (error) {
      console.error('Error closing auth modal:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log('Dialog open change:', open);
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6" aria-describedby="auth-modal-description">
        <DialogHeader>
          <div className="flex justify-center mb-3">
            <img 
              src="/panaroma-logo-final.png" 
              alt="Panaroma Facilities Management" 
              className="w-[350px] h-[105px] object-contain"
            />
          </div>
          <DialogTitle className="text-center">
            {mode === 'login' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              </div>
            )}
            {mode === 'register' && 'Join Panaroma'}

            {mode === 'otp' && 'Enter OTP Code'}
          </DialogTitle>
          <DialogDescription id="auth-modal-description" className="text-center text-gray-600 text-sm">
            {mode === 'login' && 'Sign in to your Panaroma account'}
            {mode === 'register' && 'Create your account to book cleaning services'}

            {mode === 'otp' && 'Enter the verification code sent to your email or phone'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'otp' ? (
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
              <FormField
                control={otpForm.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email or Mobile</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter email or mobile"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setOtpIdentifier(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={otpForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTP Type</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setOtpType(value as 'email' | 'mobile');
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select OTP type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="mobile">Mobile</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="outline"
                onClick={handleSendOtp}
                disabled={sendOtpMutation.isPending}
                className="w-full"
              >
                {sendOtpMutation.isPending ? 'Sending...' : 'Send OTP'}
              </Button>

              <FormField
                control={otpForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTP Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={verifyOtpMutation.isPending}
                className="w-full btn-primary"
              >
                {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setMode('login')}
                className="w-full"
              >
                Back to Login
              </Button>
            </form>
          </Form>
        ) : (
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'login' | 'register')}>
            <TabsList className="grid w-full grid-cols-2 text-sm">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              className="pl-12 h-10 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="pl-12 pr-12 h-10 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400" />
                              ) : (
                                <Eye className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between">
                    <FormField
                      control={loginForm.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm text-gray-600">
                              Remember me
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setMode('otp')}
                      className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto"
                    >
                      Forgot password?
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg"
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign In"}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 border-2 border-gray-200 hover:bg-gray-50"
                    >
                      <FaGoogle className="w-4 h-4 mr-2 text-red-500" />
                      Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 border-2 border-gray-200 hover:bg-gray-50"
                    >
                      <FaFacebook className="w-4 h-4 mr-2 text-blue-600" />
                      Facebook
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              placeholder="Enter your full name"
                              className="pl-12 h-10 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              className="pl-12 h-10 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Mobile Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              placeholder="Enter your mobile number"
                              className="pl-12 h-10 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />



                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter password"
                              className="pl-12 pr-12 h-10 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400" />
                              ) : (
                                <Eye className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm password"
                              className="pl-12 pr-12 h-10 border-2 border-gray-200 rounded-lg focus:border-blue-500"
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400" />
                              ) : (
                                <Eye className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm text-gray-600">
                            Remember me and keep me signed in
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                  >
                    {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 border-2 border-gray-200 hover:bg-gray-50"
                    >
                      <FaGoogle className="w-4 h-4 mr-2 text-red-500" />
                      Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 border-2 border-gray-200 hover:bg-gray-50"
                    >
                      <FaFacebook className="w-4 h-4 mr-2 text-blue-600" />
                      Facebook
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>


          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
