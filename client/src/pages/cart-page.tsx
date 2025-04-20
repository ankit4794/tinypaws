import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const CartPage = () => {
  const [, navigate] = useLocation();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState<string>("");
  const [pincode, setPincode] = useState<string>("");
  const [isCheckingPincode, setIsCheckingPincode] = useState<boolean>(false);
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);

  const handleQuantityChange = (productId: number, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  const handleRemoveItem = (productId: number) => {
    removeFromCart(productId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const handleApplyCoupon = () => {
    if (!couponCode) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }

    // Simulate coupon validation
    if (couponCode.toUpperCase() === "WELCOME10") {
      const discountAmount = Math.round(getCartTotal() * 0.1);
      setDiscount(discountAmount);
      toast({
        title: "Coupon Applied",
        description: "10% discount has been applied to your order",
        variant: "default",
      });
    } else {
      toast({
        title: "Invalid Coupon",
        description: "The coupon code you entered is invalid or expired",
        variant: "destructive",
      });
    }
  };

  const handleCheckPincode = async () => {
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      toast({
        title: "Invalid Pincode",
        description: "Please enter a valid 6-digit pincode",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingPincode(true);
    
    try {
      // This would be an API call in production
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simple logic for demo: even last digit means deliverable with different charges
      const lastDigit = parseInt(pincode.slice(-1));
      if (lastDigit % 2 === 0) {
        const charge = getCartTotal() > 999 ? 0 : 70;
        setDeliveryCharge(charge);
        toast({
          title: charge === 0 ? "Free Delivery" : "Delivery Available",
          description: charge === 0 
            ? "Your order qualifies for free delivery!" 
            : "Delivery is available for your location with a charge of ₹70",
          variant: "default",
        });
      } else {
        toast({
          title: "Delivery Not Available",
          description: "Sorry, we don't deliver to your area yet",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check delivery availability",
        variant: "destructive",
      });
    } finally {
      setIsCheckingPincode(false);
    }
  };

  const handleCheckout = () => {
    // In a real app, this would navigate to checkout page or initiate checkout process
    toast({
      title: "Proceeding to Checkout",
      description: "This would normally take you to the checkout page",
      variant: "default",
    });
  };

  const subtotal = getCartTotal();
  const total = subtotal + deliveryCharge - discount;
  
  const isFreeShippingEligible = subtotal >= 999;

  return (
    <>
      <Helmet>
        <title>Shopping Cart | TinyPaws</title>
        <meta name="description" content="Review your cart items and proceed to checkout" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <i className="fas fa-shopping-cart text-4xl text-gray-400 mb-3"></i>
            <h2 className="text-2xl font-medium mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Button asChild>
              <Link href="/products/dogs">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Product</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="w-20 h-20 rounded-md overflow-hidden">
                            <img 
                              src={item.images && item.images.length > 0 ? item.images[0] : '/assets/placeholder-product.png'} 
                              alt={item.name}
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            {item.selectedColor && (
                              <p className="text-sm text-gray-500">
                                Color: {item.selectedColor.charAt(0).toUpperCase() + item.selectedColor.slice(1)}
                              </p>
                            )}
                            {item.selectedSize && (
                              <p className="text-sm text-gray-500">
                                Size: {item.selectedSize.charAt(0).toUpperCase() + item.selectedSize.slice(1)}
                              </p>
                            )}
                            <button 
                              className="text-xs text-red-600 hover:text-red-800 mt-1"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>₹{item.price}</TableCell>
                        <TableCell>
                          <div className="flex items-center border border-gray-300 rounded-md w-24">
                            <button 
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <input 
                              type="number" 
                              value={item.quantity} 
                              min="1"
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)} 
                              className="w-10 py-1 text-center border-x border-gray-300"
                            />
                            <button 
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">₹{item.price * item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                >
                  <i className="fas fa-arrow-left mr-2"></i> Continue Shopping
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleClearCart}
                >
                  <i className="fas fa-trash mr-2"></i> Clear Cart
                </Button>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>Review your order details before proceeding to checkout</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>
                      {deliveryCharge === 0 ? (
                        isFreeShippingEligible ? "Free" : "Calculated at checkout"
                      ) : (
                        `₹${deliveryCharge}`
                      )}
                    </span>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{deliveryCharge ? total : subtotal}</span>
                    </div>
                    {isFreeShippingEligible && (
                      <p className="text-green-600 text-sm mt-1">
                        <i className="fas fa-check-circle mr-1"></i> Your order qualifies for FREE shipping!
                      </p>
                    )}
                  </div>
                  
                  {/* Coupon Code */}
                  <div className="pt-4">
                    <h3 className="font-medium mb-2">Have a coupon?</h3>
                    <div className="flex">
                      <Input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="rounded-r-none"
                      />
                      <Button 
                        className="rounded-l-none"
                        onClick={handleApplyCoupon}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                  
                  {/* Delivery Check */}
                  <div className="pt-4">
                    <h3 className="font-medium mb-2">Check Delivery</h3>
                    <div className="flex">
                      <Input
                        type="text"
                        placeholder="Enter pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="rounded-r-none"
                        maxLength={6}
                      />
                      <Button 
                        className="rounded-l-none"
                        onClick={handleCheckPincode}
                        disabled={isCheckingPincode}
                      >
                        {isCheckingPincode ? "Checking..." : "Check"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-black hover:bg-gray-800"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">We Accept</h3>
                <div className="flex space-x-4">
                  <i className="fab fa-cc-visa text-2xl text-gray-600"></i>
                  <i className="fab fa-cc-mastercard text-2xl text-gray-600"></i>
                  <i className="fab fa-cc-amex text-2xl text-gray-600"></i>
                  <i className="fab fa-cc-paypal text-2xl text-gray-600"></i>
                  <i className="fas fa-money-bill-wave text-2xl text-gray-600"></i>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  <i className="fas fa-lock text-green-600 mr-1"></i> Secure checkout with 100% purchase protection
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartPage;
