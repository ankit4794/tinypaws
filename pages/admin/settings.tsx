import * as React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { withAdminProtectedRoute } from '@/lib/admin-protected-route';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define schema for general settings
const generalSettingsSchema = z.object({
  siteName: z.string().min(2, { message: 'Site name is required' }),
  siteTagline: z.string().optional(),
  siteDescription: z.string().optional(),
  contactEmail: z.string().email({ message: 'Valid email is required' }),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  enableMaintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
});

// Define schema for mail settings
const mailSettingsSchema = z.object({
  mailProvider: z.enum(['mailgun', 'smtp', 'none']),
  mailFromEmail: z.string().email({ message: 'Valid email is required' }),
  mailFromName: z.string().min(2, { message: 'From name is required' }),
  mailgunDomain: z.string().optional(),
  mailgunApiKey: z.string().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.string().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpSecure: z.boolean().default(true),
});

// Define schema for shipping areas
const shippingAreaSchema = z.object({
  areaName: z.string().min(2, { message: 'Area name is required' }),
  deliveryCharge: z.string().regex(/^\d+(\.\d{1,2})?$/, { message: 'Valid amount required' }),
  minDeliveryTimeHours: z.string().regex(/^\d+$/, { message: 'Valid hours required' }),
  maxDeliveryTimeHours: z.string().regex(/^\d+$/, { message: 'Valid hours required' }),
});

type GeneralSettingsFormValues = z.infer<typeof generalSettingsSchema>;
type MailSettingsFormValues = z.infer<typeof mailSettingsSchema>;
type ShippingAreaFormValues = z.infer<typeof shippingAreaSchema>;

function SettingsPage() {
  const { toast } = useToast();
  const [newShippingArea, setNewShippingArea] = React.useState(false);

  // General settings form
  const generalForm = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      siteName: '',
      siteTagline: '',
      siteDescription: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      enableMaintenanceMode: false,
      maintenanceMessage: '',
      logoUrl: '',
      faviconUrl: '',
    },
  });

  // Mail settings form
  const mailForm = useForm<MailSettingsFormValues>({
    resolver: zodResolver(mailSettingsSchema),
    defaultValues: {
      mailProvider: 'none',
      mailFromEmail: '',
      mailFromName: '',
      mailgunDomain: '',
      mailgunApiKey: '',
      smtpHost: '',
      smtpPort: '',
      smtpUser: '',
      smtpPassword: '',
      smtpSecure: true,
    },
  });

  // Shipping area form
  const shippingAreaForm = useForm<ShippingAreaFormValues>({
    resolver: zodResolver(shippingAreaSchema),
    defaultValues: {
      areaName: '',
      deliveryCharge: '',
      minDeliveryTimeHours: '',
      maxDeliveryTimeHours: '',
    },
  });

  // Query to fetch general settings
  const { data: generalSettings, isLoading: isLoadingGeneral } = useQuery({
    queryKey: ['/api/admin/settings/general'],
    retry: 1,
    onSuccess: (data) => {
      if (data) {
        generalForm.reset(data);
      }
    },
  });

  // Query to fetch mail settings
  const { data: mailSettings, isLoading: isLoadingMail } = useQuery({
    queryKey: ['/api/admin/settings/mail'],
    retry: 1,
    onSuccess: (data) => {
      if (data) {
        mailForm.reset(data);
      }
    },
  });

  // Query to fetch shipping areas
  const { data: shippingAreas, isLoading: isLoadingShipping } = useQuery({
    queryKey: ['/api/admin/settings/shipping-areas'],
    retry: 1,
  });

  // Update general settings mutation
  const updateGeneralSettingsMutation = useMutation({
    mutationFn: async (data: GeneralSettingsFormValues) => {
      return apiRequest('PATCH', '/api/admin/settings/general', data).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'General settings updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings/general'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update mail settings mutation
  const updateMailSettingsMutation = useMutation({
    mutationFn: async (data: MailSettingsFormValues) => {
      return apiRequest('PATCH', '/api/admin/settings/mail', data).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Mail settings updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings/mail'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Create shipping area mutation
  const createShippingAreaMutation = useMutation({
    mutationFn: async (data: ShippingAreaFormValues) => {
      return apiRequest('POST', '/api/admin/settings/shipping-areas', data).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Shipping area added successfully',
      });
      setNewShippingArea(false);
      shippingAreaForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings/shipping-areas'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete shipping area mutation
  const deleteShippingAreaMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/admin/settings/shipping-areas/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Shipping area deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings/shipping-areas'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle form submissions
  const onGeneralSubmit = (data: GeneralSettingsFormValues) => {
    updateGeneralSettingsMutation.mutate(data);
  };

  const onMailSubmit = (data: MailSettingsFormValues) => {
    updateMailSettingsMutation.mutate(data);
  };

  const onShippingAreaSubmit = (data: ShippingAreaFormValues) => {
    createShippingAreaMutation.mutate(data);
  };

  // Handle delete shipping area
  const handleDeleteShippingArea = (id: string) => {
    if (window.confirm('Are you sure you want to delete this shipping area?')) {
      deleteShippingAreaMutation.mutate(id);
    }
  };

  // Handle mail provider change
  const watchMailProvider = mailForm.watch('mailProvider');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your store settings</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="mail">Mail</TabsTrigger>
          <TabsTrigger value="shipping">Shipping Areas</TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic store information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingGeneral ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <Form {...generalForm}>
                  <form
                    id="general-settings-form"
                    onSubmit={generalForm.handleSubmit(onGeneralSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <FormField
                        control={generalForm.control}
                        name="siteName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Name</FormLabel>
                            <FormControl>
                              <Input placeholder="TinyPaws" {...field} />
                            </FormControl>
                            <FormDescription>
                              The name of your store, shown in the browser title
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="siteTagline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Tagline</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Everything for your pets"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription>
                              A short description shown under your site name
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={generalForm.control}
                      name="siteDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Your comprehensive pet store..."
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Used for SEO and meta description
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <FormField
                        control={generalForm.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="support@tinypaws.com"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Primary contact email for your store
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+91 98765 43210"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription>
                              Customer service phone number
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={generalForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store Address</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="123 Main St, Bangalore, India"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Physical address of your store, shown on contact page
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <FormField
                        control={generalForm.control}
                        name="logoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="/images/logo.png"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription>
                              URL to your store logo image
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="faviconUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Favicon URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="/favicon.ico"
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription>
                              URL to your site favicon
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={generalForm.control}
                      name="enableMaintenanceMode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Maintenance Mode
                            </FormLabel>
                            <FormDescription>
                              Temporarily close your site for maintenance
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {generalForm.watch('enableMaintenanceMode') && (
                      <FormField
                        control={generalForm.control}
                        name="maintenanceMessage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maintenance Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="We're currently undergoing scheduled maintenance. Please check back soon."
                                {...field}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription>
                              Message to display during maintenance
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </form>
                </Form>
              )}
            </CardContent>
            <CardFooter className="border-t p-4">
              <Button
                type="submit"
                form="general-settings-form"
                disabled={updateGeneralSettingsMutation.isPending}
              >
                {updateGeneralSettingsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Mail Settings */}
        <TabsContent value="mail">
          <Card>
            <CardHeader>
              <CardTitle>Mail Settings</CardTitle>
              <CardDescription>Configure email delivery settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingMail ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <Form {...mailForm}>
                  <form
                    id="mail-settings-form"
                    onSubmit={mailForm.handleSubmit(onMailSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={mailForm.control}
                      name="mailProvider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mail Provider</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a mail provider" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="mailgun">Mailgun</SelectItem>
                              <SelectItem value="smtp">SMTP</SelectItem>
                              <SelectItem value="none">None (Disabled)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the service to use for sending emails
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <FormField
                        control={mailForm.control}
                        name="mailFromEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="no-reply@tinypaws.com"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              The email address emails will be sent from
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={mailForm.control}
                        name="mailFromName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Name</FormLabel>
                            <FormControl>
                              <Input placeholder="TinyPaws Store" {...field} />
                            </FormControl>
                            <FormDescription>
                              The name that will appear as the sender
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {watchMailProvider === 'mailgun' && (
                      <div className="space-y-6 border rounded-md p-4">
                        <h3 className="text-lg font-medium">Mailgun Settings</h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <FormField
                            control={mailForm.control}
                            name="mailgunDomain"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mailgun Domain</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="mg.yourdomain.com"
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={mailForm.control}
                            name="mailgunApiKey"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mailgun API Key</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="key-xxxxxxxxxxxxxxxxxxx"
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {watchMailProvider === 'smtp' && (
                      <div className="space-y-6 border rounded-md p-4">
                        <h3 className="text-lg font-medium">SMTP Settings</h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <FormField
                            control={mailForm.control}
                            name="smtpHost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SMTP Host</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="smtp.example.com"
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={mailForm.control}
                            name="smtpPort"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SMTP Port</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="587"
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={mailForm.control}
                            name="smtpUser"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SMTP Username</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="user@example.com"
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={mailForm.control}
                            name="smtpPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SMTP Password</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="••••••••"
                                    {...field}
                                    value={field.value || ''}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={mailForm.control}
                            name="smtpSecure"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Use TLS/SSL
                                  </FormLabel>
                                  <FormDescription>
                                    Enable secure connection
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </form>
                </Form>
              )}
            </CardContent>
            <CardFooter className="border-t p-4">
              <Button
                type="submit"
                form="mail-settings-form"
                disabled={updateMailSettingsMutation.isPending}
              >
                {updateMailSettingsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Shipping Areas */}
        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Areas</CardTitle>
              <CardDescription>
                Configure delivery areas and shipping charges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingShipping ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="border rounded-md">
                    <div className="flex items-center justify-between border-b p-4">
                      <h3 className="text-lg font-medium">Existing Shipping Areas</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNewShippingArea(!newShippingArea)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {newShippingArea ? 'Cancel' : 'Add New Area'}
                      </Button>
                    </div>
                    
                    <div className="p-4">
                      {shippingAreas?.length > 0 ? (
                        <ScrollArea className="h-80">
                          <div className="space-y-4">
                            {shippingAreas.map((area: any) => (
                              <div
                                key={area._id}
                                className="flex justify-between items-center border rounded-md p-3"
                              >
                                <div>
                                  <h4 className="font-medium">{area.areaName}</h4>
                                  <div className="text-sm text-muted-foreground">
                                    ₹{area.deliveryCharge} • {area.minDeliveryTimeHours}-
                                    {area.maxDeliveryTimeHours} hours
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteShippingArea(area._id)}
                                  disabled={deleteShippingAreaMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No shipping areas defined yet. Add your first area.
                        </div>
                      )}
                    </div>
                  </div>

                  {newShippingArea && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Add Shipping Area</CardTitle>
                        <CardDescription>
                          Define a new delivery zone with charges
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...shippingAreaForm}>
                          <form
                            id="shipping-area-form"
                            onSubmit={shippingAreaForm.handleSubmit(
                              onShippingAreaSubmit
                            )}
                            className="space-y-4"
                          >
                            <FormField
                              control={shippingAreaForm.control}
                              name="areaName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Area Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g. Bangalore City"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Name of the delivery area
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-3 gap-4">
                              <FormField
                                control={shippingAreaForm.control}
                                name="deliveryCharge"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Delivery Charge (₹)</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="e.g. 50"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={shippingAreaForm.control}
                                name="minDeliveryTimeHours"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Min Time (Hours)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g. 24" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={shippingAreaForm.control}
                                name="maxDeliveryTimeHours"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Max Time (Hours)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g. 48" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                      <CardFooter className="border-t p-4">
                        <Button
                          type="submit"
                          form="shipping-area-form"
                          disabled={createShippingAreaMutation.isPending}
                        >
                          {createShippingAreaMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Plus className="mr-2 h-4 w-4" />
                              Add Area
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default withAdminProtectedRoute(SettingsPage);