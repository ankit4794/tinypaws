import * as React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';

export default function CartPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    items,
    subtotal,
    deliveryCharge,
    tax,
    total,
    updateItem,
    removeItem,
    clearCart,
    setDeliveryCharge,
  } = useCart();

  // Fetch available shipping areas
  const { data: shippingAreas } = useQuery({
    queryKey: ['/api/shipping-areas'],
    retry: 1,
  });

  // Handle shipping area change
  const handleShippingAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedAreaCharge = parseFloat(e.target.value);
    setDeliveryCharge(selectedAreaCharge);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Handle checkout button click
  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add items to your cart before checking out',
        variant: 'destructive',
      });
      return;
    }

    router.push('/checkout');
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link href="/products">
            <Button size="lg">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({items.length})</CardTitle>
                <CardDescription>Review and modify your selected items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item._id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 border-b">
                      <div className="relative h-24 w-24 rounded-md overflow-hidden bg-muted">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-muted">
                            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <Link href={`/products/${item.slug}`}>
                          <h3 className="font-medium hover:underline">{item.name}</h3>
                        </Link>
                        {(item.weight || item.pack || item.variant) && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {item.weight && <span>Weight: {item.weight}</span>}
                            {item.weight && item.pack && <span> • </span>}
                            {item.pack && <span>Pack: {item.pack}</span>}
                            {(item.weight || item.pack) && item.variant && <span> • </span>}
                            {item.variant && <span>Variant: {item.variant}</span>}
                          </div>
                        )}
                        <div className="mt-2">
                          {item.salePrice ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{formatCurrency(item.salePrice)}</span>
                              <span className="text-sm line-through text-muted-foreground">
                                {formatCurrency(item.price)}
                              </span>
                            </div>
                          ) : (
                            <span className="font-medium">{formatCurrency(item.price)}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateItem(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateItem(item._id, item.quantity + 1)}
                          disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="text-right font-medium">
                        {formatCurrency((item.salePrice || item.price) * item.quantity)}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item._id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" onClick={clearCart}>
                  Clear Cart
                </Button>
                <Link href="/products">
                  <Button variant="link">
                    Continue Shopping
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your order details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Shipping area selector */}
                <div className="space-y-2">
                  <label htmlFor="shipping-area" className="block text-sm font-medium">
                    Delivery Area
                  </label>
                  <select
                    id="shipping-area"
                    className="w-full border border-input rounded-md h-10 px-3"
                    onChange={handleShippingAreaChange}
                    defaultValue={deliveryCharge}
                  >
                    <option value="0">Select delivery area</option>
                    {shippingAreas?.map((area: any) => (
                      <option key={area._id} value={area.deliveryCharge}>
                        {area.areaName} (₹{area.deliveryCharge})
                      </option>
                    ))}
                  </select>
                </div>

                <Separator />

                {/* Order details */}
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

                <Separator />

                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={items.length === 0 || deliveryCharge === 0}
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}