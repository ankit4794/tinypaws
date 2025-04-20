import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { useLocation } from 'wouter';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, ShoppingBag } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const { toast } = useToast();
  const { adminUser, adminLoginMutation } = useAdminAuth();
  const [, navigate] = useLocation();
  const [isAdminLoginFailed, setIsAdminLoginFailed] = useState(false);
  const isLoading = adminLoginMutation.isPending;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    // Redirect to admin dashboard if already logged in as admin
    if (adminUser) {
      navigate('/admin');
    }
  }, [adminUser, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsAdminLoginFailed(false);
    
    adminLoginMutation.mutate(data, {
      onSuccess: (user) => {
        if (user.role !== 'ADMIN') {
          setIsAdminLoginFailed(true);
          toast({
            title: "Access Denied",
            description: "You don't have admin privileges.",
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Login Successful",
          description: "Welcome to the admin dashboard.",
        });
        
        navigate('/admin');
      },
      onError: (error) => {
        console.error("Login error:", error);
        toast({
          title: "Login Failed",
          description: error.message || "Invalid email or password.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-slate-900 text-white py-4 border-b border-slate-800">
        <div className="container mx-auto px-4 flex items-center">
          <div className="flex items-center">
            <ShoppingBag className="h-6 w-6 text-primary mr-2" />
            <span className="text-xl font-bold">TinyPaws Admin</span>
          </div>
        </div>
      </header>
      
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...form.register('password')}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                )}
              </div>
              
              {isAdminLoginFailed && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You don't have admin privileges to access the dashboard.
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login to Admin Panel'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="border-t px-6 py-4 bg-gray-50">
            <div className="text-sm text-slate-500">
              Default admin: admin@tinypaws.com / admin123
            </div>
          </CardFooter>
        </Card>
      </main>
      
      <footer className="bg-slate-900 text-slate-400 py-3 text-center text-xs border-t border-slate-700">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center space-x-3">
            <span>&copy; {new Date().getFullYear()} TinyPaws Admin</span>
            <span>•</span>
            <span>Version 1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}