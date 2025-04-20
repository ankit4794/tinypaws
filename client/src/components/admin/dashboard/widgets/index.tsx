import { Widget, WidgetType } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SalesSummaryWidget from './sales-summary-widget';
import RecentOrdersWidget from './recent-orders-widget';
import LowStockWidget from './low-stock-widget';
import TopProductsWidget from './top-products-widget';
import OrderStatusWidget from './order-status-widget';

interface DashboardWidgetProps {
  widget: Widget;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
}

const DashboardWidget = ({ widget, onToggleVisibility }: DashboardWidgetProps) => {
  const renderWidgetContent = () => {
    switch (widget.type) {
      case WidgetType.SALES_SUMMARY:
        return <SalesSummaryWidget />;
      case WidgetType.RECENT_ORDERS:
        return <RecentOrdersWidget />;
      case WidgetType.LOW_STOCK:
        return <LowStockWidget />;
      case WidgetType.TOP_PRODUCTS:
        return <TopProductsWidget />;
      case WidgetType.ORDER_STATUS:
        return <OrderStatusWidget />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <Card className="shadow-md h-full">
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-md font-medium">{widget.title}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Widget Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onToggleVisibility(widget.id, !widget.isVisible)}
            >
              {widget.isVisible ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  <span>Hide Widget</span>
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>Show Widget</span>
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-4 py-2">
        {renderWidgetContent()}
      </CardContent>
    </Card>
  );
};

export default DashboardWidget;