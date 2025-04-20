import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HelpDeskPage() {
  return (
    <AdminLayout>
      <div className="py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Help Desk</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Customer support inquiries will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}