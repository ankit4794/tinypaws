import type { AppProps } from 'next/app';
import { AuthProvider } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import '@/styles/globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function App({ Component, pageProps }: AppProps) {
  // Check if the current path is an admin route
  const isAdminRoute = 
    typeof window !== 'undefined' ? 
      window.location.pathname.startsWith('/admin') : 
      false;

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        {/* Only add header/footer for non-admin pages */}
        {!isAdminRoute && <Header />}
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
        {!isAdminRoute && <Footer />}
      </div>
      <Toaster />
    </AuthProvider>
  );
}