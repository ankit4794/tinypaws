import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../hooks/use-auth';

export default function HomePage() {
  const { user, isLoading } = useAuth();

  return (
    <div>
      <Head>
        <title>TinyPaws - Pet Products Store</title>
        <meta name="description" content="Your one-stop shop for all pet products. Find the best quality food, accessories, toys and more for your pets." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-black">TinyPaws</span>
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/" className="border-black text-black inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Home
                </Link>
                <Link href="/products" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Products
                </Link>
                <Link href="/about" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  About
                </Link>
                <Link href="/contact" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Contact
                </Link>
              </nav>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {!isLoading && (
                user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-700">Hello, {user.username}</span>
                    <Link href="/account" className="text-sm text-gray-700 hover:text-gray-900">
                      My Account
                    </Link>
                    <button 
                      onClick={() => {/* Logout logic */}}
                      className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link href="/auth" className="text-sm text-gray-700 hover:text-gray-900">
                      Sign in
                    </Link>
                    <Link
                      href="/auth"
                      className="bg-black border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Sign up
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="bg-white">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Welcome to TinyPaws</span>
                <span className="block text-primary">Pet Products Store</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Your one-stop shop for all pet products. Find the best quality food, accessories, toys and more for your pets.
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <Link
                    href="/products"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 md:py-4 md:text-lg md:px-10"
                  >
                    Shop Now
                  </Link>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <Link
                    href="/categories"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-black bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                  >
                    Categories
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Products Section Placeholder */}
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
                Featured Products
              </h2>
              <p className="mt-4 max-w-3xl mx-auto text-gray-500">
                Check out our latest and most popular items!
              </p>
            </div>
            <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {/* Placeholder for products */}
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900">Product {item}</h3>
                    <p className="mt-1 text-sm text-gray-500">Product description</p>
                    <p className="mt-2 text-lg font-medium text-gray-900">₹699</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="flex flex-wrap justify-center">
            <div className="px-5 py-2">
              <Link href="/about" className="text-base text-gray-500 hover:text-gray-900">
                About
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link href="/contact" className="text-base text-gray-500 hover:text-gray-900">
                Contact
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link href="/privacy-policy" className="text-base text-gray-500 hover:text-gray-900">
                Privacy Policy
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link href="/terms" className="text-base text-gray-500 hover:text-gray-900">
                Terms of Service
              </Link>
            </div>
          </nav>
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; 2023 TinyPaws Pet Store. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}