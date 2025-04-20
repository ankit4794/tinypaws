import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomersManagement() {
  return (
    <AdminLayout>
      <div className="py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Customers Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Customer management functionality will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}