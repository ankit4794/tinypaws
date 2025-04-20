import { useAuth } from '../hooks/use-auth';
import Link from 'next/link';

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Welcome to TinyPaws
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Premium products for your beloved pets
          </p>
        </div>

        <div className="mt-12">
          {user ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg max-w-3xl mx-auto">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  User Information
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  You are logged in as:
                </p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {user.email}
                    </dd>
                  </div>
                  {user.fullName && (
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Full name</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {user.fullName}
                      </dd>
                    </div>
                  )}
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {user.role}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg text-gray-600 mb-6">
                You're not signed in. Please sign in to continue.
              </p>
              <Link href="/auth">
                <span className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark">
                  Sign in / Register
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}