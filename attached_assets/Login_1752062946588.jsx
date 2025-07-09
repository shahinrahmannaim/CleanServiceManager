import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Sparkles, Mail, Lock, Eye, EyeOff } from "lucide-react";
import logoImage from "@assets/WhatsApp Image 2025-06-23 at 09.05.23_1750847082310.jpeg";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login({ onSuccess }) {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data) => apiRequest("POST", "/api/auth/login", data),
    onSuccess: (response) => {
      if (onSuccess) {
        onSuccess();
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });
        setLocation("/dashboard");
      }
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <img 
            src={logoImage} 
            alt="Panaroma Cleaning Services" 
            className="h-16 w-auto object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your Panaroma account</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
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
            control={form.control}
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

          <div className="text-right">
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Form>
    </div>
  );
}