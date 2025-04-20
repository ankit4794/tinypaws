import * as React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ChevronLeft, CreditCard, Truck, User, MapPin, Phone, Mail, Check } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Define schema for checkout form
const checkoutSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name is required' }),
  email: z.string().email({ message: 'Valid email is required' }),
  mobile: z.string().min(10, { message: 'Valid mobile number is required' }),
  address: z.string().min(5, { message: 'Address is required' }),
  city: z.string().min(2, { message: 'City is required' }),
  state: z.string().min(2, { message: 'State is required' }),
  pincode: z.string().min(6, { message: 'Valid pincode is required' }),
  paymentMethod: z.enum(['cod', 'online']),
  deliveryInstructions: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    items,
    subtotal,
    deliveryCharge,
    tax,
    total,
    clearCart,
  } = useCart();
  const [isOrderComplete, setIsOrderComplete] = React.useState(false);
  const [orderData, setOrderData] = React.useState<any>(null);

  // Redirect to cart if cart is empty
  React.useEffect(() => {
    if (items.length === 0 && !isOrderComplete) {
      router.replace('/cart');
    }
  }, [items.length, router, isOrderComplete]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Form
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      paymentMethod: 'cod',
      deliveryInstructions: '',
    },
  });

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormValues) => {
      const orderData = {
        ...data,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.salePrice || item.price,
          weight: item.weight,
          pack: item.pack,
          variant: item.variant,
        })),
        subtotal,
        deliveryCharge,
        tax,
        total,
      };
      
      return apiRequest('POST', '/api/orders', orderData).then(res => res.json());
    },
    onSuccess: (data) => {
      setOrderData(data);
      setIsOrderComplete(true);
      clearCart();
      toast({
        title: 'Order placed successfully',
        description: `Your order #${data.orderNumber} has been placed successfully`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to place order',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Pincode verification query
  const [pincode, setPincode] = React.useState<string>('');
  const [shouldVerify, setShouldVerify] = React.useState(false);
  
  const { data: pincodeData, isLoading: verifyingPincode } = useQuery({
    queryKey: ['/api/pincode', pincode],
    enabled: shouldVerify && pincode.length === 6,
    retry: 1,
    staleTime: Infinity,
  });

  // Handle pincode change and verification
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPincode(value);
    setShouldVerify(false);
  };

  const verifyPincode = () => {
    if (pincode.length === 6) {
      setShouldVerify(true);
    }
  };

  // Handle form submission
  const onSubmit = (data: CheckoutFormValues) => {
    if (!pincodeData?.isServiceable) {
      toast({
        title: 'Delivery not available',
        description: 'Sorry, we do not deliver to this pincode yet',
        variant: 'destructive',
      });
      return;
    }
    
    placeOrderMutation.mutate(data);
  };

  // Order success view
  if (isOrderComplete && orderData) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <Card className="border-primary/20">
          <CardHeader className="bg-primary-foreground border-b text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <Check className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl mt-4">Order Successfully Placed!</CardTitle>
            <CardDescription>
              Thank you for your order. We'll send you a confirmation email shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">Order Number</h3>
                  <p className="text-primary"># {orderData.orderNumber}</p>
                </div>
                <div className="text-right">
                  <h3 className="font-medium">Order Date</h3>
                  <p>{new Date(orderData.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Order Summary</h3>
              <div className="border rounded-lg">
                <div className="p-4 border-b">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatCurrency(orderData.subtotal)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">GST (18%):</span>
                    <span>{formatCurrency(orderData.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span>{formatCurrency(orderData.deliveryCharge)}</span>
                  </div>
                </div>
                <div className="p-4 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(orderData.total)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Shipping Address</h3>
              <div className="border rounded-lg p-4">
                <p className="font-medium">{orderData.fullName}</p>
                <p>{orderData.address}</p>
                <p>{orderData.city}, {orderData.state} - {orderData.pincode}</p>
                <p>Phone: {orderData.mobile}</p>
                <p>Email: {orderData.email}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Payment Method</h3>
              <div className="border rounded-lg p-4">
                <p className="flex items-center">
                  {orderData.paymentMethod === 'cod' ? (
                    <>
                      <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                      Cash on Delivery (COD)
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                      Online Payment
                    </>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4 border-t pt-6">
            <Link href="/orders">
              <Button variant="outline">View My Orders</Button>
            </Link>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/cart" className="flex items-center text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Cart
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
              <CardDescription>Enter your shipping details</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  id="checkout-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="you@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+91 98765 43210"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="123 Main St, Apartment 4B"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Bangalore" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="Karnataka" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div>
                      <FormField
                        control={form.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input
                                  placeholder="560001"
                                  maxLength={6}
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handlePincodeChange(e);
                                  }}
                                />
                              </FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={verifyPincode}
                                disabled={field.value.length !== 6 || verifyingPincode}
                              >
                                {verifyingPincode ? 'Checking...' : 'Check'}
                              </Button>
                            </div>
                            {shouldVerify && pincodeData && (
                              <div className="mt-2">
                                {pincodeData.isServiceable ? (
                                  <p className="text-sm text-green-600 flex items-center">
                                    <Check className="h-4 w-4 mr-1" />
                                    Delivery available to this pincode
                                  </p>
                                ) : (
                                  <p className="text-sm text-red-600">
                                    Sorry, we do not deliver to this pincode yet
                                  </p>
                                )}
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="deliveryInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Instructions (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any special instructions for delivery"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Add any special instructions for the delivery person
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-3"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="cod" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer flex items-center">
                                  <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                                  Cash on Delivery (COD)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="online" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer flex items-center">
                                  <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                                  Online Payment (Credit/Debit Card, UPI, etc.)
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your order details</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible defaultValue="items">
                <AccordionItem value="items">
                  <AccordionTrigger>
                    Items ({items.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 mt-2">
                      {items.map((item) => (
                        <div key={item._id} className="flex gap-3">
                          <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium line-clamp-1">{item.name}</h4>
                            <div className="text-xs text-muted-foreground">
                              Qty: {item.quantity} × {formatCurrency(item.salePrice || item.price)}
                            </div>
                            {(item.weight || item.pack || item.variant) && (
                              <div className="text-xs text-muted-foreground">
                                {item.weight && `Weight: ${item.weight}`}
                                {item.weight && item.pack && ' • '}
                                {item.pack && `Pack: ${item.pack}`}
                                {(item.weight || item.pack) && item.variant && ' • '}
                                {item.variant && `Variant: ${item.variant}`}
                              </div>
                            )}
                          </div>
                          <div className="text-sm font-medium">
                            {formatCurrency((item.salePrice || item.price) * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (18%):</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery:</span>
                  <span>{formatCurrency(deliveryCharge)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                type="submit"
                form="checkout-form"
                disabled={
                  items.length === 0 ||
                  placeOrderMutation.isPending ||
                  !pincodeData?.isServiceable
                }
              >
                {placeOrderMutation.isPending ? 'Processing...' : 'Place Order'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}