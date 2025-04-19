import { useEffect, useState } from "react";
import { Redirect, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, ChevronRight } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const registerSchema = z.object({
  fullName: z.string().min(3, { message: "Full name is required" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  mobile: z.string().regex(/^\d{10}$/, { message: "Please enter a valid 10-digit mobile number" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const otpEmailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const otpMobileSchema = z.object({
  mobile: z.string().regex(/^\d{10}$/, { message: "Please enter a valid 10-digit mobile number" }),
});

const otpVerifySchema = z.object({
  otp: z.string().min(4, { message: "Please enter the OTP" }),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;
type OtpEmailValues = z.infer<typeof otpEmailSchema>;
type OtpMobileValues = z.infer<typeof otpMobileSchema>;
type OtpVerifyValues = z.infer<typeof otpVerifySchema>;

const AuthPage = () => {
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  
  // State for OTP flow
  const [otpMode, setOtpMode] = useState<'inactive' | 'email' | 'mobile' | 'verify'>('inactive');
  const [otpSentTo, setOtpSentTo] = useState<string>('');
  const [otpRequestId, setOtpRequestId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      mobile: "",
      password: "",
    },
  });

  const onLoginSubmit = (values: LoginValues) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: RegisterValues) => {
    // Extract just the fields needed for registration
    const { username, email, password, fullName, mobile } = values;
    registerMutation.mutate({ username, email, password, fullName, mobile });
  };

  // Setup OTP form handlers
  const otpEmailForm = useForm<OtpEmailValues>({
    resolver: zodResolver(otpEmailSchema),
    defaultValues: {
      email: "",
    },
  });

  const otpMobileForm = useForm<OtpMobileValues>({
    resolver: zodResolver(otpMobileSchema),
    defaultValues: {
      mobile: "",
    },
  });

  const otpVerifyForm = useForm<OtpVerifyValues>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: {
      otp: "",
    },
  });

  // Send OTP via Email
  const handleEmailOTP = async (values: OtpEmailValues) => {
    try {
      setIsLoading(true);
      const res = await apiRequest("POST", "/api/auth/request-otp", {
        email: values.email,
        channel: 'email'
      });
      const data = await res.json();
      
      setOtpRequestId(data.token);
      setOtpSentTo(values.email);
      setOtpMode('verify');
      
      toast({
        title: "OTP Sent",
        description: `OTP has been sent to ${values.email}`,
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP via Mobile
  const handleMobileOTP = async (values: OtpMobileValues) => {
    try {
      setIsLoading(true);
      const res = await apiRequest("POST", "/api/auth/request-otp", {
        mobile: values.mobile,
        channel: 'sms'
      });
      const data = await res.json();
      
      setOtpRequestId(data.token);
      setOtpSentTo(values.mobile);
      setOtpMode('verify');
      
      toast({
        title: "OTP Sent",
        description: `OTP has been sent to ${values.mobile}`,
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (values: OtpVerifyValues) => {
    try {
      setIsLoading(true);
      const res = await apiRequest("POST", "/api/auth/verify-otp", {
        token: otpRequestId,
        otp: values.otp
      });
      
      const data = await res.json();
      
      // Refresh user data by querying the /api/user endpoint
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Success",
        description: "You have successfully logged in.",
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = "/api/auth/google";
  };

  const handleFacebookLogin = () => {
    // Redirect to Facebook OAuth endpoint
    window.location.href = "/api/auth/facebook";
  };
  
  const handleOtpLogin = () => {
    setOtpMode('email');
  };

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-screen">
      {/* Left Column - Auth Forms */}
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Welcome to TinyPaws</CardTitle>
            <CardDescription>
              Login to your account or create a new one to start shopping for your pets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
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
                            <Input type="password" placeholder="Enter your password" {...field} />
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
                      {loginMutation.isPending ? "Logging in..." : "Login"}
                    </Button>
                    
                    <div className="text-center">
                      <a href="#" className="text-sm text-black hover:underline">
                        Forgot Password?
                      </a>
                    </div>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
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
                            <Input type="email" placeholder="Enter your email" {...field} />
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
                          <FormLabel>Mobile Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="Enter your mobile number" {...field} />
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
                            <Input placeholder="Choose a username" {...field} />
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
                            <Input type="password" placeholder="Create a password" {...field} />
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
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <div className="my-6 flex items-center">
                <Separator className="flex-grow" />
                <span className="px-4 text-gray-500 text-sm">OR</span>
                <Separator className="flex-grow" />
              </div>
              
              <div className="space-y-3">
                {otpMode === 'inactive' && (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center"
                      onClick={handleGoogleLogin}
                    >
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" className="w-5 h-5 mr-2" />
                      Continue with Google
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center"
                      onClick={handleFacebookLogin}
                    >
                      <img src="https://www.svgrepo.com/show/475657/facebook-color.svg" alt="Facebook logo" className="w-5 h-5 mr-2" />
                      Continue with Facebook
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center"
                      onClick={handleOtpLogin}
                    >
                      <Loader2 className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : 'hidden'}`} />
                      <span>Login with OTP</span>
                    </Button>
                  </>
                )}
                
                {otpMode === 'email' && (
                  <>
                    <Form {...otpEmailForm}>
                      <form onSubmit={otpEmailForm.handleSubmit(handleEmailOTP)} className="space-y-4">
                        <FormField
                          control={otpEmailForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter your email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline"
                            className="flex-1"
                            onClick={() => setOtpMode('mobile')}
                          >
                            Use Mobile
                          </Button>
                          <Button 
                            type="submit" 
                            className="flex-1"
                            disabled={isLoading}
                          >
                            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Send OTP
                          </Button>
                        </div>
                        
                        <Button 
                          type="button" 
                          variant="link"
                          className="w-full"
                          onClick={() => setOtpMode('inactive')}
                        >
                          Back to Login Options
                        </Button>
                      </form>
                    </Form>
                  </>
                )}
                
                {otpMode === 'mobile' && (
                  <>
                    <Form {...otpMobileForm}>
                      <form onSubmit={otpMobileForm.handleSubmit(handleMobileOTP)} className="space-y-4">
                        <FormField
                          control={otpMobileForm.control}
                          name="mobile"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mobile Number</FormLabel>
                              <FormControl>
                                <Input type="tel" placeholder="Enter your 10-digit mobile number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline"
                            className="flex-1"
                            onClick={() => setOtpMode('email')}
                          >
                            Use Email
                          </Button>
                          <Button 
                            type="submit" 
                            className="flex-1"
                            disabled={isLoading}
                          >
                            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Send OTP
                          </Button>
                        </div>
                        
                        <Button 
                          type="button" 
                          variant="link"
                          className="w-full"
                          onClick={() => setOtpMode('inactive')}
                        >
                          Back to Login Options
                        </Button>
                      </form>
                    </Form>
                  </>
                )}
                
                {otpMode === 'verify' && (
                  <>
                    <Form {...otpVerifyForm}>
                      <form onSubmit={otpVerifyForm.handleSubmit(handleVerifyOTP)} className="space-y-4">
                        <div className="text-center mb-2">
                          <p className="text-sm text-gray-500">Enter the OTP sent to</p>
                          <p className="font-medium">{otpSentTo}</p>
                        </div>
                        
                        <FormField
                          control={otpVerifyForm.control}
                          name="otp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>OTP</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter OTP" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          Verify & Login
                        </Button>
                        
                        <Button 
                          type="button" 
                          variant="link"
                          className="w-full"
                          onClick={() => setOtpMode('inactive')}
                        >
                          Back to Login Options
                        </Button>
                      </form>
                    </Form>
                  </>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Right Column - Hero Section */}
      <div className="hidden md:flex flex-col justify-center">
        <div className="space-y-6 max-w-md">
          <h1 className="text-4xl font-bold">Shop the Best for Your Pets</h1>
          <p className="text-gray-600">
            Join TinyPaws today and discover premium products for your furry friends. From nutrition to toys, we have everything your pet needs to thrive.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <i className="fas fa-check-circle text-green-500 mr-2"></i>
              <span>Premium quality products for all pets</span>
            </li>
            <li className="flex items-center">
              <i className="fas fa-check-circle text-green-500 mr-2"></i>
              <span>Fast shipping across India</span>
            </li>
            <li className="flex items-center">
              <i className="fas fa-check-circle text-green-500 mr-2"></i>
              <span>Expert pet care advice and support</span>
            </li>
            <li className="flex items-center">
              <i className="fas fa-check-circle text-green-500 mr-2"></i>
              <span>Special offers and discounts for members</span>
            </li>
          </ul>
          <div className="pt-4">
            <img 
              src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1969&q=80" 
              alt="Happy dog" 
              className="rounded-lg shadow-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
