import Link from 'next/link';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Lock,
  TruckDelivery
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer() {
  return (
    <footer className="bg-white text-black">
      {/* Newsletter Section */}
      <div className="border-t border-b">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-bold mb-1">Subscribe to our newsletter</h3>
              <p className="text-gray-600">
                Get the latest updates on new products and upcoming sales
              </p>
            </div>
            <div>
              <form className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="flex-grow"
                />
                <Button type="submit">Subscribe</Button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div>
            <h3 className="font-bold text-lg mb-4">TinyPaws</h3>
            <p className="text-gray-600 mb-4">
              Your one-stop shop for all pet needs. We provide high-quality products
              for your furry, feathery, or scaly friends.
            </p>
            <div className="flex gap-4">
              <Link href="https://facebook.com" className="text-gray-600 hover:text-black">
                <Facebook size={20} />
              </Link>
              <Link href="https://twitter.com" className="text-gray-600 hover:text-black">
                <Twitter size={20} />
              </Link>
              <Link href="https://instagram.com" className="text-gray-600 hover:text-black">
                <Instagram size={20} />
              </Link>
              <Link href="https://youtube.com" className="text-gray-600 hover:text-black">
                <Youtube size={20} />
              </Link>
            </div>
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-600 hover:text-black">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/products?category=dogs" className="text-gray-600 hover:text-black">
                  Dogs
                </Link>
              </li>
              <li>
                <Link href="/products?category=cats" className="text-gray-600 hover:text-black">
                  Cats
                </Link>
              </li>
              <li>
                <Link href="/products?category=small-animals" className="text-gray-600 hover:text-black">
                  Small Animals
                </Link>
              </li>
              <li>
                <Link href="/offers" className="text-gray-600 hover:text-black">
                  Offers & Deals
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Customer Service */}
          <div>
            <h3 className="font-bold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-600 hover:text-black">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-gray-600 hover:text-black">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-600 hover:text-black">
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-600 hover:text-black">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-black">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 4: Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                <span className="text-gray-600">
                  123 Pet Street, New Delhi, 110001, India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-600" />
                <span className="text-gray-600">+91 1234567890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-600" />
                <span className="text-gray-600">info@tinypaws.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Payment Methods & Trust Badges */}
      <div className="border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <img src="/visa.svg" alt="Visa" className="h-8" />
              <img src="/mastercard.svg" alt="Mastercard" className="h-8" />
              <img src="/paypal.svg" alt="PayPal" className="h-8" />
              <img src="/americanexpress.svg" alt="American Express" className="h-8" />
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2">
                <TruckDelivery className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">Free Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">COD Available</span>
              </div>
            </div>
            
            <div className="text-center md:text-right text-gray-600 text-sm">
              © {new Date().getFullYear()} TinyPaws. All rights reserved.
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Links */}
      <div className="bg-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600">
            <Link href="/privacy" className="hover:text-black">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-black">
              Terms & Conditions
            </Link>
            <span>|</span>
            <Link href="/shipping-policy" className="hover:text-black">
              Shipping Policy
            </Link>
            <span>|</span>
            <Link href="/refund-policy" className="hover:text-black">
              Refund Policy
            </Link>
            <span>|</span>
            <Link href="/sitemap" className="hover:text-black">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}