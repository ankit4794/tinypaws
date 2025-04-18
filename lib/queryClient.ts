import { QueryClient } from '@tanstack/react-query';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  data?: any,
) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error || errorData?.message || 'Something went wrong';
    throw new Error(errorMessage);
  }
  
  return response;
}

type QueryFnOptions = {
  on401?: 'returnNull' | 'throw';
};

export function getQueryFn({ on401 = 'throw' }: QueryFnOptions = {}) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const endpoint = queryKey[0];
    const response = await fetch(endpoint, {
      credentials: 'include',
    });

    if (response.status === 401) {
      if (on401 === 'returnNull') {
        return null;
      }
      throw new Error('Unauthorized');
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(error.message || 'Failed to fetch data');
    }
    
    return response.json();
  };
}