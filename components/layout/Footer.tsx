import Link from "next/link";

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
              <li><Link href="/about"><span className="text-gray-600 hover:text-black">About Us</span></Link></li>
              <li><Link href="/contact"><span className="text-gray-600 hover:text-black">Contact Us</span></Link></li>
              <li><Link href="/blogs"><span className="text-gray-600 hover:text-black">Blog</span></Link></li>
              <li><Link href="/faqs"><span className="text-gray-600 hover:text-black">FAQs</span></Link></li>
              <li><Link href="/store-locator"><span className="text-gray-600 hover:text-black">Store Locator</span></Link></li>
            </ul>
          </div>
          
          {/* Column 3: Shop */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/products/dogs"><span className="text-gray-600 hover:text-black">Dogs</span></Link></li>
              <li><Link href="/products/cats"><span className="text-gray-600 hover:text-black">Cats</span></Link></li>
              <li><Link href="/products/small-animals"><span className="text-gray-600 hover:text-black">Small Animals</span></Link></li>
              <li><Link href="/products/best-sellers"><span className="text-gray-600 hover:text-black">Best Sellers</span></Link></li>
              <li><Link href="/products/new-arrivals"><span className="text-gray-600 hover:text-black">New Arrivals</span></Link></li>
            </ul>
          </div>
          
          {/* Column 4: Help */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Help</h3>
            <ul className="space-y-2">
              <li><Link href="/track-order"><span className="text-gray-600 hover:text-black">Track Your Order</span></Link></li>
              <li><Link href="/shipping-policy"><span className="text-gray-600 hover:text-black">Shipping Policy</span></Link></li>
              <li><Link href="/returns"><span className="text-gray-600 hover:text-black">Returns & Exchanges</span></Link></li>
              <li><Link href="/payment-options"><span className="text-gray-600 hover:text-black">Payment Options</span></Link></li>
              <li><Link href="/privacy-policy"><span className="text-gray-600 hover:text-black">Privacy Policy</span></Link></li>
              <li><Link href="/terms"><span className="text-gray-600 hover:text-black">Terms & Conditions</span></Link></li>
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