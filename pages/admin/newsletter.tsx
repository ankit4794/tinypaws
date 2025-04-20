import * as React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PlusCircle, Trash2, Loader2, Send, Upload } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { withAdminProtectedRoute } from '@/lib/admin-protected-route';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

// Define schema for campaign form
const campaignSchema = z.object({
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters' }),
  body: z.string().min(10, { message: 'Content must be at least 10 characters' }),
});

// Define schema for subscriber import form
const importSchema = z.object({
  file: z.any()
    .refine((file) => file?.[0], { message: 'File is required' })
    .refine((file) => {
      if (!file?.[0]) return false;
      return file[0].type === 'text/csv';
    }, { message: 'File must be a CSV file' }),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;
type ImportFormValues = z.infer<typeof importSchema>;

function NewsletterPage() {
  const { toast } = useToast();
  const [isNewCampaignDialogOpen, setIsNewCampaignDialogOpen] = React.useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Campaign form
  const campaignForm = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      subject: '',
      body: '',
    },
  });

  // Import form
  const importForm = useForm<ImportFormValues>({
    resolver: zodResolver(importSchema),
  });

  // Query to fetch subscribers
  const { data: subscribers, isLoading: isLoadingSubscribers } = useQuery({
    queryKey: ['/api/admin/newsletter/subscribers'],
    retry: 1,
  });

  // Query to fetch campaigns
  const { data: campaigns, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['/api/admin/newsletter/campaigns'],
    retry: 1,
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormValues) => {
      return apiRequest('POST', '/api/admin/newsletter/campaigns', data).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Campaign created and scheduled for sending',
      });
      setIsNewCampaignDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/newsletter/campaigns'] });
      campaignForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Import subscribers mutation
  const importSubscribersMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest('POST', '/api/admin/newsletter/subscribers/import', formData).then(res => res.json());
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: `Imported ${data.imported} subscribers. ${data.skipped || 0} were skipped.`,
      });
      setIsImportDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/newsletter/subscribers'] });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      importForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete subscriber mutation
  const deleteSubscriberMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/admin/newsletter/subscribers/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Subscriber removed successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/newsletter/subscribers'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle campaign form submission
  const onCampaignSubmit = (data: CampaignFormValues) => {
    createCampaignMutation.mutate(data);
  };

  // Handle import form submission
  const onImportSubmit = (data: ImportFormValues) => {
    if (!data.file?.[0]) return;
    
    const formData = new FormData();
    formData.append('file', data.file[0]);
    importSubscribersMutation.mutate(formData);
  };

  // Handle delete subscriber
  const handleDeleteSubscriber = (id: string) => {
    if (window.confirm('Are you sure you want to remove this subscriber?')) {
      deleteSubscriberMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Management</h1>
          <p className="text-muted-foreground">Manage subscribers and email campaigns</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsImportDialogOpen(true)} variant="outline">
            <Upload className="mr-2 h-4 w-4" /> Import Subscribers
          </Button>
          <Button onClick={() => setIsNewCampaignDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> New Campaign
          </Button>
        </div>
      </div>

      <Tabs defaultValue="subscribers">
        <TabsList className="mb-4">
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <CardTitle>All Subscribers</CardTitle>
              <CardDescription>Manage your newsletter subscribers</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSubscribers ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : subscribers?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subscribed Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.map((subscriber: any) => (
                      <TableRow key={subscriber._id}>
                        <TableCell className="font-medium">{subscriber.email}</TableCell>
                        <TableCell>
                          <Badge variant={subscriber.active ? 'default' : 'outline'}>
                            {subscriber.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(subscriber.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSubscriber(subscriber._id)}
                            disabled={deleteSubscriberMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No subscribers found. Try importing some or encourage website visitors to subscribe.
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Total subscribers: {subscribers?.length || 0}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Email Campaigns</CardTitle>
              <CardDescription>View and manage your email campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCampaigns ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : campaigns?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent Date</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Opens</TableHead>
                      <TableHead>Clicks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign: any) => (
                      <TableRow key={campaign._id}>
                        <TableCell className="font-medium">{campaign.subject}</TableCell>
                        <TableCell>
                          <Badge variant={campaign.status === 'sent' ? 'default' : 'secondary'}>
                            {campaign.status === 'sent' ? 'Sent' : 'Scheduled'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {campaign.sentAt
                            ? new Date(campaign.sentAt).toLocaleDateString()
                            : 'Not sent yet'}
                        </TableCell>
                        <TableCell>{campaign.recipientCount || 0}</TableCell>
                        <TableCell>{campaign.openCount || 0}</TableCell>
                        <TableCell>{campaign.clickCount || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No campaigns found. Create your first campaign by clicking "New Campaign".
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Campaign Dialog */}
      <Dialog open={isNewCampaignDialogOpen} onOpenChange={setIsNewCampaignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create a New Email Campaign</DialogTitle>
            <DialogDescription>
              Compose a newsletter to send to all your subscribers
            </DialogDescription>
          </DialogHeader>

          <Form {...campaignForm}>
            <form onSubmit={campaignForm.handleSubmit(onCampaignSubmit)} className="space-y-4">
              <FormField
                control={campaignForm.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the email subject line" {...field} />
                    </FormControl>
                    <FormDescription>
                      The subject line of your newsletter email
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={campaignForm.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your newsletter content here..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The main content of your newsletter in HTML format
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsNewCampaignDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createCampaignMutation.isPending}
                >
                  {createCampaignMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Create & Schedule
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Import Subscribers Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Subscribers</DialogTitle>
            <DialogDescription>
              Upload a CSV file with subscriber emails
            </DialogDescription>
          </DialogHeader>

          <Form {...importForm}>
            <form onSubmit={importForm.handleSubmit(onImportSubmit)} className="space-y-4">
              <FormField
                control={importForm.control}
                name="file"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>CSV File</FormLabel>
                    <FormControl>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={(e) => onChange(e.target.files)}
                        {...fieldProps}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload a CSV file with one email per line
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsImportDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={importSubscribersMutation.isPending}
                >
                  {importSubscribersMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    "Import"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withAdminProtectedRoute(NewsletterPage);