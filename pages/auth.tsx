import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../hooks/use-auth';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loginMutation, registerMutation } = useAuth();
  const router = useRouter();
  
  // Set up login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Set up register form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
    },
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);
  
  // Handle login submission
  const onLoginSubmit = async (values: LoginValues) => {
    loginMutation.mutate(values);
  };
  
  // Handle registration submission
  const onRegisterSubmit = async (values: RegisterValues) => {
    registerMutation.mutate(values);
  };

  // Don't render anything if redirecting
  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left column: Auth forms */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 md:px-8 bg-white">
        <div className="mx-auto w-full max-w-md">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
          
          <div className="mt-8">
            {/* Toggle between login and register */}
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
              </button>
            </div>
            
            {/* Login Form */}
            {isLogin && (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      {...loginForm.register('email')}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                    {loginForm.formState.errors.email && (
                      <p className="mt-2 text-sm text-red-600">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      {...loginForm.register('password')}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                    {loginForm.formState.errors.password && (
                      <p className="mt-2 text-sm text-red-600">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                  >
                    {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </form>
            )}
            
            {/* Register Form */}
            {!isLogin && (
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      {...registerForm.register('fullName')}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                    {registerForm.formState.errors.fullName && (
                      <p className="mt-2 text-sm text-red-600">
                        {registerForm.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="reg-email"
                      type="email"
                      autoComplete="email"
                      {...registerForm.register('email')}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                    {registerForm.formState.errors.email && (
                      <p className="mt-2 text-sm text-red-600">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="reg-password"
                      type="password"
                      autoComplete="new-password"
                      {...registerForm.register('password')}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                    {registerForm.formState.errors.password && (
                      <p className="mt-2 text-sm text-red-600">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                  >
                    {registerMutation.isPending ? 'Creating account...' : 'Create account'}
                  </button>
                </div>
              </form>
            )}
            
            {/* Social login options (placeholders) */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div>
                  <a
                    href="#"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Sign in with Google</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                    </svg>
                  </a>
                </div>
                
                <div>
                  <a
                    href="#"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Sign in with Facebook</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right column: Hero image and text */}
      <div className="flex-1 bg-primary-50 flex flex-col justify-center relative hidden md:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark opacity-90"></div>
        <div className="p-12 relative z-10 text-white">
          <div className="max-w-xl mx-auto">
            <h1 className="text-4xl font-bold mb-6">Welcome to TinyPaws</h1>
            <p className="text-xl mb-8">
              Your one-stop shop for all your pet's needs. Join our community of pet lovers and discover premium products for your furry friends.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center">
                <svg
                  className="h-6 w-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Premium quality pet products</span>
              </li>
              <li className="flex items-center">
                <svg
                  className="h-6 w-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Fast delivery across India</span>
              </li>
              <li className="flex items-center">
                <svg
                  className="h-6 w-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Expert advice for pet parents</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}