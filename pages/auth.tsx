import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Form schemas
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onError: (error) => {
        toast({
          title: 'Login failed',
          description: error.message || 'Invalid username or password',
          variant: 'destructive',
        });
      },
    });
  };

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      fullName: '',
    },
  });

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data, {
      onError: (error) => {
        toast({
          title: 'Registration failed',
          description: error.message || 'Could not create account',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <>
      <Head>
        <title>Sign In or Register - TinyPaws</title>
        <meta name="description" content="Sign in to your TinyPaws account or create a new account" />
      </Head>

      <div className="flex min-h-screen">
        {/* Left side: Auth forms */}
        <div className="flex items-center justify-center w-full lg:w-1/2 p-8">
          <div className="w-full max-w-md">
            <a href="/" className="inline-block mb-8">
              <h1 className="text-2xl font-bold">TinyPaws</h1>
            </a>

            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your account
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          placeholder="Enter your username"
                          {...loginForm.register('username')}
                        />
                        {loginForm.formState.errors.username && (
                          <p className="text-sm text-red-500">{loginForm.formState.errors.username.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          {...loginForm.register('password')}
                        />
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>
                      Enter your details to create a new account
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name (Optional)</Label>
                        <Input
                          id="fullName"
                          placeholder="Enter your full name"
                          {...registerForm.register('fullName')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          placeholder="Choose a username"
                          {...registerForm.register('username')}
                        />
                        {registerForm.formState.errors.username && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.username.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          {...registerForm.register('email')}
                        />
                        {registerForm.formState.errors.email && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Create a password"
                          {...registerForm.register('password')}
                        />
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right side: Hero image and text */}
        <div className="hidden lg:flex lg:w-1/2 bg-gray-100 flex-col items-center justify-center p-12 relative">
          <div className="max-w-lg text-center z-10">
            <h2 className="text-3xl font-bold mb-6">Welcome to TinyPaws</h2>
            <p className="text-lg mb-8">
              The best destination for all your pet needs. Join our community of pet lovers and discover premium products for your furry friends.
            </p>
            <div className="flex justify-center space-x-4">
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">5,000+</div>
                <div className="text-sm">Products</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">50,000+</div>
                <div className="text-sm">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">24/7</div>
                <div className="text-sm">Support</div>
              </div>
            </div>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80" 
            alt="Happy pets" 
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        </div>
      </div>
    </>
  );
}