import type { AppProps } from 'next/app';
import React from 'react';
import { AuthProvider } from '../hooks/use-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../styles/globals.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  // Check if the current path is an admin route
  const isAdminRoute = 
    typeof window !== 'undefined' ? 
      window.location.pathname.startsWith('/admin') : 
      false;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">
            <Component {...pageProps} />
          </main>
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}