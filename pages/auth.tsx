import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { z } from 'zod';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { SocialLogin } from '@/components/auth/SocialLogin';
import { OtpAuth } from '@/components/auth/OtpAuth';

// Login Schema
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Register Schema
const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().optional(),
  mobile: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<'traditional' | 'otp'>('traditional');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    router.push('/');
    return null;
  }

  // Login Form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Register Form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      fullName: '',
      mobile: '',
    },
  });

  // Handle login form submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  // Handle register form submission
  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  // Handle successful login from OTP
  const handleOtpLoginSuccess = (user: any) => {
    router.push('/');
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col lg:flex-row min-h-[80vh] gap-8">
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <Card className="mx-auto w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Welcome to TinyPaws</CardTitle>
              <CardDescription>
                Login or create an account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                  
                  {/* Method Selection */}
                  <div className="flex justify-center mt-4 mb-6">
                    <div className="inline-flex rounded-md shadow-sm" role="group">
                      <Button
                        type="button"
                        variant={authMethod === 'traditional' ? 'default' : 'outline'}
                        className="rounded-l-md"
                        onClick={() => setAuthMethod('traditional')}
                      >
                        Email & Password
                      </Button>
                      <Button
                        type="button"
                        variant={authMethod === 'otp' ? 'default' : 'outline'}
                        className="rounded-r-md"
                        onClick={() => setAuthMethod('otp')}
                      >
                        OTP Login
                      </Button>
                    </div>
                  </div>

                  {authMethod === 'traditional' ? (
                    <>
                      {/* Traditional Login/Register */}
                      <TabsContent value="login">
                        <Form {...loginForm}>
                          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                            <FormField
                              control={loginForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input placeholder="email@example.com" {...field} />
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
                                    <Input type="password" placeholder="••••••••" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button 
                              type="submit" 
                              className="w-full"
                              disabled={loginMutation.isPending}
                            >
                              {loginMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Logging in...
                                </>
                              ) : 'Login'}
                            </Button>
                            
                            <SocialLogin onSocialLoginStart={() => setIsLoading(true)} />
                          </form>
                        </Form>
                      </TabsContent>
                      
                      <TabsContent value="register">
                        <Form {...registerForm}>
                          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                            <FormField
                              control={registerForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input placeholder="username" {...field} />
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
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="email@example.com" {...field} />
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
                                    <Input type="password" placeholder="••••••••" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="fullName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name (Optional)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John Doe" {...field} />
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
                                  <FormLabel>Mobile (Optional)</FormLabel>
                                  <FormControl>
                                    <Input type="tel" placeholder="+91 9876543210" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
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
                              ) : 'Register'}
                            </Button>
                            
                            <SocialLogin onSocialLoginStart={() => setIsLoading(true)} />
                          </form>
                        </Form>
                      </TabsContent>
                    </>
                  ) : (
                    <div className="py-2">
                      <OtpAuth onLoginSuccess={handleOtpLoginSuccess} />
                    </div>
                  )}
                </Tabs>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center text-sm text-muted-foreground">
              <p>By continuing, you agree to TinyPaws</p>
              <div className="flex gap-1">
                <Button variant="link" className="p-0 h-auto">Terms of Service</Button>
                <span>&</span>
                <Button variant="link" className="p-0 h-auto">Privacy Policy</Button>
              </div>
            </CardFooter>
          </Card>
        </div>
        
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-muted rounded-lg p-6 lg:p-12">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold mb-4">Your Pet's New Best Friend</h2>
            <p className="text-xl mb-6">
              Shop premium pet products for your furry companions at TinyPaws - India's favorite pet store.
            </p>
            <ul className="space-y-2 mb-8 text-lg">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Free shipping on orders above ₹499</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Premium quality products</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Same-day delivery in select cities</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>24/7 customer support</span>
              </li>
            </ul>
            <div className="hidden lg:block">
              <blockquote className="italic border-l-4 border-primary pl-4 py-2 my-4">
                "TinyPaws has been a game changer for our furry family. Their products are of exceptional quality and service is unmatched!"
                <footer className="text-right mt-2 font-medium">— Priya & Max (Golden Retriever)</footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}