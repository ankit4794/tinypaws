import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem('cookie-consent') === 'true';
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md p-4 md:p-6 z-50">
      <div className="container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1 pr-4">
          <p className="text-sm text-gray-600 mb-2">
            We use cookies to enhance your experience on our website. By continuing to browse this site, you agree to our use of cookies.
          </p>
          <div className="text-xs text-gray-500">
            Read our{' '}
            <Link href="/privacy-policy" className="text-primary underline hover:text-primary/80">
              Privacy Policy
            </Link>{' '}
            for more information.
          </div>
        </div>
        <div className="flex gap-3 mt-2 md:mt-0">
          <button
            onClick={acceptCookies}
            className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-primary/90 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="border border-gray-300 bg-transparent px-3 py-2 rounded-md text-sm hover:bg-gray-50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;