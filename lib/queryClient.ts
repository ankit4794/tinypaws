import { QueryClient } from '@tanstack/react-query';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const json = JSON.parse(text);
      message = json.error || json.message || text;
    } catch (_) {
      // If parse fails, use text as error message
    }
    throw new Error(message);
  }
}

export async function apiRequest(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: any
) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(path, options);
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options?: {
  on401?: UnauthorizedBehavior;
}) => () => Promise<T> = (options) => {
  return async ({queryKey}) => {
    const [path] = queryKey as string[];
    const res = await fetch(path, {
      credentials: 'include',
    });
    
    if (res.status === 401) {
      if (options?.on401 === "returnNull") {
        return null as any;
      }
      throw new Error("Unauthorized");
    }
    
    await throwIfResNotOk(res);
    
    return await res.json();
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});