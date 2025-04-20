import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Heart, ShoppingCart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '@/hooks/use-wishlist';
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
import { Badge } from '@/components/ui/badge';

export default function WishlistPage() {
  const { toast } = useToast();
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Add to cart
  const handleAddToCart = (item: any) => {
    addItem({
      _id: `temp_${Date.now()}_${item.productId}`,
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      image: item.image,
      price: item.price,
      salePrice: item.salePrice,
      quantity: 1,
    });
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <Heart className="h-16 w-16 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">
            Start saving your favorite products to your wishlist.
          </p>
          <Link href="/products">
            <Button size="lg">
              Explore Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">{items.length} items in your wishlist</p>
            <Button variant="outline" onClick={clearWishlist}>
              Clear Wishlist
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <Card key={item._id} className="overflow-hidden">
                <div className="aspect-square relative">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-90"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {item.salePrice && (
                    <Badge variant="destructive" className="absolute top-2 left-2">
                      Sale
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <Link href={`/products/${item.slug}`}>
                    <h3 className="font-medium line-clamp-2 hover:underline">{item.name}</h3>
                  </Link>
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
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button
                    className="w-full"
                    onClick={() => handleAddToCart(item)}
                    disabled={item.inStock === false}
                  >
                    {item.inStock === false ? (
                      'Out of Stock'
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}