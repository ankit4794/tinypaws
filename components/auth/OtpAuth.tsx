import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

// OTP Request Schema
const otpRequestSchema = z.object({
  email: z.string().email('Invalid email').optional(),
  mobile: z.string().min(10, 'Invalid mobile number').optional(),
}).refine((data) => data.email || data.mobile, {
  message: 'Either email or mobile is required',
  path: ['email'], 
});

type OtpRequestValues = z.infer<typeof otpRequestSchema>;

// OTP Verification Schema
const otpVerifySchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
  username: z.string().min(3, 'Username is required and must be at least 3 characters'),
  fullName: z.string().optional(),
});

type OtpVerifyValues = z.infer<typeof otpVerifySchema>;

interface OtpAuthProps {
  onLoginSuccess: (user: any) => void;
}

export const OtpAuth: React.FC<OtpAuthProps> = ({ onLoginSuccess }) => {
  const { toast } = useToast();
  const [otpSent, setOtpSent] = useState(false);
  const [otpType, setOtpType] = useState<'email' | 'mobile'>('email');
  const [otpValue, setOtpValue] = useState('');

  // OTP Request Form
  const otpRequestForm = useForm<OtpRequestValues>({
    resolver: zodResolver(otpRequestSchema),
    defaultValues: {
      email: '',
      mobile: '',
    },
  });

  // OTP Verification Form
  const otpVerifyForm = useForm<OtpVerifyValues>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: {
      otp: '',
      username: '',
      fullName: '',
    },
  });

  // OTP Request Mutation
  const otpRequestMutation = useMutation({
    mutationFn: async (data: { type: 'email' | 'mobile', value: string }) => {
      const res = await apiRequest('POST', '/api/auth/otp/send', data);
      return await res.json();
    },
    onSuccess: () => {
      setOtpSent(true);
      toast({
        title: 'OTP Sent',
        description: `Verification code sent to your ${otpType}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send OTP',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // OTP Verification Mutation
  const otpVerifyMutation = useMutation({
    mutationFn: async (data: OtpVerifyValues) => {
      const res = await apiRequest('POST', '/api/auth/otp/verify', data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.isExistingUser ? 'Login Successful' : 'Account Created',
        description: data.message,
      });
      onLoginSuccess(data.user);
    },
    onError: (error: Error) => {
      toast({
        title: 'Verification Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle OTP Request
  const onOtpRequest = (data: OtpRequestValues) => {
    let type: 'email' | 'mobile' = 'email';
    let value = '';

    if (data.email) {
      type = 'email';
      value = data.email;
    } else if (data.mobile) {
      type = 'mobile';
      value = data.mobile;
    }

    setOtpType(type);
    setOtpValue(value);
    otpRequestMutation.mutate({ type, value });
  };

  // Handle OTP Verification
  const onOtpVerify = (data: OtpVerifyValues) => {
    otpVerifyMutation.mutate(data);
  };

  return (
    <div className="w-full">
      {!otpSent ? (
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" onClick={() => setOtpType('email')}>Email</TabsTrigger>
            <TabsTrigger value="mobile" onClick={() => setOtpType('mobile')}>Mobile</TabsTrigger>
          </TabsList>
          
          <Form {...otpRequestForm}>
            <form onSubmit={otpRequestForm.handleSubmit(onOtpRequest)} className="space-y-4 mt-4">
              <TabsContent value="email">
                <FormField
                  control={otpRequestForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="email@example.com" 
                          type="email" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="mobile">
                <FormField
                  control={otpRequestForm.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+91 9876543210" 
                          type="tel" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={otpRequestMutation.isPending}
              >
                {otpRequestMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : 'Request OTP'}
              </Button>
            </form>
          </Form>
        </Tabs>
      ) : (
        <Form {...otpVerifyForm}>
          <form onSubmit={otpVerifyForm.handleSubmit(onOtpVerify)} className="space-y-4">
            <div className="space-y-2">
              <Label>Verification sent to {otpType === 'email' ? 'Email' : 'Mobile'}</Label>
              <p className="text-sm text-muted-foreground">{otpValue}</p>
            </div>

            <FormField
              control={otpVerifyForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OTP Code</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="123456" 
                      maxLength={6}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={otpVerifyForm.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="username" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={otpVerifyForm.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="John Doe" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline"
                className="w-1/2" 
                onClick={() => setOtpSent(false)}
                disabled={otpVerifyMutation.isPending}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                className="w-1/2" 
                disabled={otpVerifyMutation.isPending}
              >
                {otpVerifyMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : 'Verify OTP'}
              </Button>
            </div>

            <Button 
              type="button" 
              variant="link" 
              className="w-full" 
              onClick={() => {
                setOtpSent(false);
                otpRequestMutation.mutate({ type: otpType, value: otpValue });
              }}
              disabled={otpRequestMutation.isPending}
            >
              {otpRequestMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : 'Resend OTP'}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};