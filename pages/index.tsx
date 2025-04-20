import * as React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { withProtectedRoute } from '@/lib/protected-route';

function HomePage() {
  const { user, logoutMutation } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      <Head>
        <title>TinyPaws - Welcome</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8 p-4 border-b">
          <h1 className="text-2xl font-bold">TinyPaws</h1>
          <div className="flex items-center gap-4">
            {user ? (
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            ) : (
              <Link href="/auth">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </header>

        <main>
          <div className="max-w-3xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Welcome to TinyPaws, {user?.fullName || user?.username}!</CardTitle>
                <CardDescription>
                  Your one-stop shop for all your pet needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  You are logged in as <strong>{user?.email}</strong> with role <strong>{user?.role}</strong>.
                </p>
                <p>
                  This is a protected page that only authenticated users can see. We're in the process of migrating from a dual React/Next.js structure to a cleaner Next.js-only architecture.
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push('/products')}>
                  View Products
                </Button>
                <Button onClick={() => router.push('/categories')}>
                  Browse Categories
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}

export default withProtectedRoute(HomePage);