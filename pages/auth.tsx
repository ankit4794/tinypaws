import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Mail, Lock, User, CheckCircle } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const router = useRouter();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  
  // Redirect if already logged in
  if (user) {
    router.push('/');
    return null;
  }
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        router.push('/');
      },
    });
  };
  
  const onRegisterSubmit = (data: RegisterFormValues) => {
    // Extract what we need for the API
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData, {
      onSuccess: () => {
        router.push('/');
      },
    });
  };

  return (
    <>
      <Head>
        <title>Login or Register | TinyPaws</title>
        <meta name="description" content="Sign in to your TinyPaws account or create a new one to start shopping for your pet companions." />
      </Head>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              {/* Auth Forms */}
              <div className="bg-white p-8 rounded-lg shadow-md">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 mb-8">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                  
                  {/* Login Form */}
                  <TabsContent value="login">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold">Welcome Back</h2>
                      <p className="text-gray-600">Sign in to your account to continue</p>
                    </div>
                    
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                  <Input placeholder="Your username" className="pl-10" {...field} />
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
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                  <Input type="password" placeholder="Your password" className="pl-10" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              id="remember-me"
                              name="remember-me"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                              Remember me
                            </label>
                          </div>
                          
                          <div className="text-sm">
                            <Link href="/forgot-password" className="text-black hover:underline">
                              Forgot your password?
                            </Link>
                          </div>
                        </div>
                        
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing in...
                            </>
                          ) : (
                            'Sign in'
                          )}
                        </Button>
                      </form>
                    </Form>
                    
                    <div className="mt-6">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="bg-white px-2 text-gray-500">Or continue with</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <Button variant="outline" type="button" className="w-full">
                          Google
                        </Button>
                        <Button variant="outline" type="button" className="w-full">
                          Facebook
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center text-sm">
                      <span className="text-gray-600">Don't have an account?</span>
                      <button
                        type="button"
                        className="ml-1 text-black hover:underline"
                        onClick={() => setActiveTab('register')}
                      >
                        Create one now
                      </button>
                    </div>
                  </TabsContent>
                  
                  {/* Register Form */}
                  <TabsContent value="register">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold">Create an Account</h2>
                      <p className="text-gray-600">Join TinyPaws to start shopping</p>
                    </div>
                    
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                  <Input placeholder="Your full name" className="pl-10" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                  <Input placeholder="Choose a username" className="pl-10" {...field} />
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
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                  <Input type="email" placeholder="Your email address" className="pl-10" {...field} />
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
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                  <Input type="password" placeholder="Create a password" className="pl-10" {...field} />
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
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                  <Input type="password" placeholder="Confirm your password" className="pl-10" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="terms"
                              name="terms"
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                              required
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="terms" className="text-gray-600">
                              I agree to the{' '}
                              <Link href="/terms" className="text-black hover:underline">
                                Terms of Service
                              </Link>{' '}
                              and{' '}
                              <Link href="/privacy" className="text-black hover:underline">
                                Privacy Policy
                              </Link>
                            </label>
                          </div>
                        </div>
                        
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            'Create Account'
                          )}
                        </Button>
                      </form>
                    </Form>
                    
                    <div className="mt-6 text-center text-sm">
                      <span className="text-gray-600">Already have an account?</span>
                      <button
                        type="button"
                        className="ml-1 text-black hover:underline"
                        onClick={() => setActiveTab('login')}
                      >
                        Sign in
                      </button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Info Section */}
              <div className="bg-gray-100 p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Welcome to TinyPaws</h2>
                <p className="mb-6 text-gray-600">
                  Join our community of pet lovers and discover premium products for your furry, feathery, or scaly companions.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium">Track Your Orders</h3>
                      <p className="text-sm text-gray-600">
                        Keep track of all your orders and get timely delivery updates.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium">Wishlist</h3>
                      <p className="text-sm text-gray-600">
                        Save your favorite products for future purchases.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium">Faster Checkout</h3>
                      <p className="text-sm text-gray-600">
                        Save your delivery address and payment details for quicker checkout.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium">Exclusive Offers</h3>
                      <p className="text-sm text-gray-600">
                        Get access to member-only deals and promotions.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 bg-white p-6 rounded-lg border">
                  <h3 className="font-bold mb-2">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Our customer support team is available to assist you with any questions or concerns.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}