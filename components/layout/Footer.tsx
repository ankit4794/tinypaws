import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Column 1: About */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <div className="text-2xl font-bold flex items-center">
                <span className="text-black mr-1">tiny</span>
                <span className="text-black font-bold">paws</span>
                <i className="fas fa-paw ml-1 text-black"></i>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              TinyPaws is India's premier online pet store offering premium products for dogs, cats, and small animals. We're dedicated to making pet parenting easier with quality products and exceptional service.
            </p>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-600 hover:text-black">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-600 hover:text-black">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-600 hover:text-black">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-600 hover:text-black">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-600 hover:text-black">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-black">Contact Us</Link></li>
              <li><Link href="/blogs" className="text-gray-600 hover:text-black">Blog</Link></li>
              <li><Link href="/faqs" className="text-gray-600 hover:text-black">FAQs</Link></li>
              <li><Link href="/store-locator" className="text-gray-600 hover:text-black">Store Locator</Link></li>
            </ul>
          </div>
          
          {/* Column 3: Shop */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/products/dogs" className="text-gray-600 hover:text-black">Dogs</Link></li>
              <li><Link href="/products/cats" className="text-gray-600 hover:text-black">Cats</Link></li>
              <li><Link href="/products/small-animals" className="text-gray-600 hover:text-black">Small Animals</Link></li>
              <li><Link href="/products/best-sellers" className="text-gray-600 hover:text-black">Best Sellers</Link></li>
              <li><Link href="/products/new-arrivals" className="text-gray-600 hover:text-black">New Arrivals</Link></li>
            </ul>
          </div>
          
          {/* Column 4: Help */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Help</h3>
            <ul className="space-y-2">
              <li><Link href="/track-order" className="text-gray-600 hover:text-black">Track Your Order</Link></li>
              <li><Link href="/shipping-policy" className="text-gray-600 hover:text-black">Shipping Policy</Link></li>
              <li><Link href="/returns" className="text-gray-600 hover:text-black">Returns & Exchanges</Link></li>
              <li><Link href="/payment-options" className="text-gray-600 hover:text-black">Payment Options</Link></li>
              <li><Link href="/privacy-policy" className="text-gray-600 hover:text-black">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-600 hover:text-black">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Contact & Payment */}
        <div className="flex flex-col md:flex-row justify-between py-6 border-t border-gray-200">
          <div className="mb-4 md:mb-0">
            <h3 className="font-semibold mb-2">Contact Us</h3>
            <p className="text-gray-600"><i className="fas fa-envelope mr-2"></i> support@tinypaws.in</p>
            <p className="text-gray-600"><i className="fas fa-phone-alt mr-2"></i> +91 1234567890</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Secure Payments</h3>
            <div className="flex space-x-4">
              <i className="fab fa-cc-visa text-2xl text-gray-600"></i>
              <i className="fab fa-cc-mastercard text-2xl text-gray-600"></i>
              <i className="fab fa-cc-amex text-2xl text-gray-600"></i>
              <i className="fab fa-cc-paypal text-2xl text-gray-600"></i>
              <i className="fas fa-money-bill-wave text-2xl text-gray-600"></i>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="text-center pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-sm">© {new Date().getFullYear()} TinyPaws. All rights reserved.</p>
        </div>
      </div>

      {/* WhatsApp Support Button */}
      <a href="#" className="fixed bottom-6 right-6 bg-green-500 text-white p-3 rounded-full shadow-lg z-40 hover:bg-green-600 transition-all">
        <i className="fab fa-whatsapp text-2xl"></i>
      </a>
    </footer>
  );
};

export default Footer;
