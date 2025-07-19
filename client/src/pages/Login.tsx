import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth";
import { login } from "../lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or mobile is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

interface LoginProps {
  onSuccess?: () => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useAuth();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: ({ identifier, password }: { identifier: string; password: string }) =>
      login(identifier, password),
    onSuccess: (data) => {
      setUser(data.user);
      if (onSuccess) {
        onSuccess();
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });
        setLocation("/");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <img 
            src="/panaroma-logo-final.png" 
            alt="Panaroma Facilities Management" 
            className="w-[280px] h-[85px] object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your Panaroma account</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Email or Mobile</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Enter your email or mobile"
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

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}