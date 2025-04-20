import { useState } from "react";
import { Helmet } from "react-helmet";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Send, MessageSquare, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewsletterSubscribeForm } from "@/components/newsletter/subscribe-form";
import { CreateTicketForm } from "@/components/helpdesk/create-ticket-form";
import { TicketList } from "@/components/helpdesk/ticket-list";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().regex(/^\d{10}$/, { message: "Please enter a valid 10-digit phone number" }),
  subject: z.string().min(1, { message: "Please select a subject" }),
  orderNumber: z.string().optional(),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
  preferredContact: z.enum(["email", "phone", "whatsapp"], { required_error: "Please select a preferred contact method" }),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to our terms and conditions" }),
  }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const ContactPage = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  
  // Check if user is authenticated
  const { data: user, isLoading: authLoading } = useQuery({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      orderNumber: "",
      message: "",
      preferredContact: "email",
      agreeToTerms: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      const response = await apiRequest('POST', '/api/helpdesk/contact', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        contactMethod: data.preferredContact,
        orderId: data.orderNumber || undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "We've received your message and will get back to you soon!",
        variant: "default",
      });
      form.reset();
      setSubmitted(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ContactFormValues) => {
    mutation.mutate(values);
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | TinyPaws</title>
        <meta name="description" content="Contact TinyPaws customer support for any queries related to pet products, orders, or general information." />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Banner */}
        <div className="bg-gray-50 rounded-xl overflow-hidden mb-12">
          <div className="relative h-64">
            <img 
              src="https://images.unsplash.com/photo-1534361960057-19889db9621e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
              alt="Contact TinyPaws Customer Support" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white">Contact Us</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              <p className="text-gray-600 mb-8">
                Have a question about an order, our products, or just want to say hello? We're here to help! Choose the most convenient way to reach us.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-gray-100 p-3 rounded-full mr-4">
                    <i className="fas fa-map-marker-alt text-black"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Visit Us</h3>
                    <p className="text-gray-600">
                      TinyPaws Headquarters<br />
                      42, Linking Road, Bandra West<br />
                      Mumbai, Maharashtra - 400050
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-gray-100 p-3 rounded-full mr-4">
                    <i className="fas fa-phone-alt text-black"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Call Us</h3>
                    <p className="text-gray-600">+91 1234567890</p>
                    <p className="text-gray-500 text-sm">Monday to Saturday, 9AM to 6PM</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-gray-100 p-3 rounded-full mr-4">
                    <i className="fas fa-envelope text-black"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email Us</h3>
                    <p className="text-gray-600">support@tinypaws.in</p>
                    <p className="text-gray-500 text-sm">We'll respond within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-gray-100 p-3 rounded-full mr-4">
                    <i className="fab fa-whatsapp text-black"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">WhatsApp Support</h3>
                    <p className="text-gray-600">+91 9876543210</p>
                    <p className="text-gray-500 text-sm">Chat with us for instant support</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="font-semibold mb-4">Connect With Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="bg-gray-100 p-3 rounded-full text-black hover:bg-gray-200 transition">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" className="bg-gray-100 p-3 rounded-full text-black hover:bg-gray-200 transition">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="#" className="bg-gray-100 p-3 rounded-full text-black hover:bg-gray-200 transition">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className="bg-gray-100 p-3 rounded-full text-black hover:bg-gray-200 transition">
                    <i className="fab fa-youtube"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form and Helpdesk */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <Tabs defaultValue="contact" className="mb-6">
                <TabsList className="grid grid-cols-2 mb-8">
                  <TabsTrigger value="contact">Contact Form</TabsTrigger>
                  <TabsTrigger value="helpdesk">Support Ticket</TabsTrigger>
                </TabsList>
                
                <TabsContent value="contact">
                  <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
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
                          <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your 10-digit phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="order">Order Inquiry</SelectItem>
                              <SelectItem value="product">Product Information</SelectItem>
                              <SelectItem value="return">Return/Exchange</SelectItem>
                              <SelectItem value="feedback">Feedback</SelectItem>
                              <SelectItem value="partnership">Business Partnership</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="orderNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Number (if applicable)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your order number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please describe your query or message in detail" 
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="preferredContact"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Preferred Contact Method <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="email" id="contact-email" />
                              <label htmlFor="contact-email" className="text-sm font-medium">Email</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="phone" id="contact-phone" />
                              <label htmlFor="contact-phone" className="text-sm font-medium">Phone Call</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="whatsapp" id="contact-whatsapp" />
                              <label htmlFor="contact-whatsapp" className="text-sm font-medium">WhatsApp</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to the <a href="/terms" className="text-blue-600 hover:underline">Terms and Conditions</a> and <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a> <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-black hover:bg-gray-800"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="helpdesk">
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold mb-6">Create Support Ticket</h2>
                      <p className="text-gray-600 mb-4">
                        Need help with something specific? Create a support ticket and our team will assist you as soon as possible.
                      </p>
                      <CreateTicketForm />
                    </div>
                    
                    {/* Only show ticket list for authenticated users */}
                    <div className="mt-8 pt-8 border-t">
                      <h2 className="text-2xl font-bold mb-6">Your Tickets</h2>
                      
                      {user ? (
                        <Card>
                          <CardHeader>
                            <CardTitle>Recent Support Tickets</CardTitle>
                            <CardDescription>
                              View and manage your existing support requests.
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <TicketList />
                          </CardContent>
                        </Card>
                      ) : (
                        <Card>
                          <CardHeader>
                            <CardTitle>Login Required</CardTitle>
                            <CardDescription>
                              Please log in to view and manage your support tickets.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="text-center py-8">
                            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-4">You need to be logged in to view your support tickets.</p>
                            <Button variant="outline" className="mt-2" asChild>
                              <a href="/auth">
                                <LogIn className="mr-2 h-4 w-4" />
                                Login / Register
                              </a>
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Find Us</h2>
          <div className="h-[400px] rounded-xl overflow-hidden">
            {/* In a real implementation, this would be a Google Map */}
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <p className="text-gray-600">Google Map would be integrated here</p>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-16 bg-gray-50 p-10 rounded-xl">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-3">Subscribe to Our Newsletter</h2>
            <p className="text-gray-600 mb-6">
              Stay updated with new pet products, care tips, and exclusive offers.
            </p>
            <NewsletterSubscribeForm variant="stacked" className="max-w-md mx-auto" />
          </div>
        </div>

        {/* FAQs Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-lg mb-2">What are your delivery timelines?</h3>
              <p className="text-gray-600">We deliver across India within 2-5 business days. Metro cities typically receive deliveries within 48 hours. You can check exact delivery estimates by entering your pincode on the product page.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-lg mb-2">How can I track my order?</h3>
              <p className="text-gray-600">Once your order is shipped, you'll receive a tracking link via email and SMS. You can also track your order by logging into your account and visiting the "Order History" section.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-lg mb-2">What is your return policy?</h3>
              <p className="text-gray-600">We offer a 7-day return policy for most products. Items must be unused and in their original packaging. Some items like food and treats may not be eligible for returns due to quality and safety concerns.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-lg mb-2">How can I cancel my order?</h3>
              <p className="text-gray-600">You can cancel your order before it's shipped by contacting our customer support team or through your account dashboard. Once the order is shipped, you'll need to follow our return process.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
