import type { AppProps } from 'next/app';
import { AuthProvider } from '../hooks/use-auth';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  // Check if the current path is an admin route
  const isAdminRoute = 
    typeof window !== 'undefined' ? 
      window.location.pathname.startsWith('/admin') : 
      false;

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
      </div>
    </AuthProvider>
  );
}