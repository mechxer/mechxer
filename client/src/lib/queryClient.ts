/**
 * This file contains helpers for making API requests with proper error handling
 */

// We're avoiding direct imports from @tanstack/react-query to avoid TypeScript errors
// The rest of the app will still import the queryClient and apiRequest from here

async function throwIfResNotOk(res: Response): Promise<void> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text || res.statusText}`);
  }
}

/**
 * Make an API request with proper error handling
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: any
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

/**
 * Fetch data from the API with authentication handling
 */
export async function fetchWithAuth(url: string, throwOn401 = true): Promise<any> {
  const res = await fetch(url, {
    credentials: "include",
  });

  if (res.status === 401) {
    if (!throwOn401) {
      return null;
    }
    throw new Error("Unauthorized");
  }

  await throwIfResNotOk(res);
  return await res.json();
}

/**
 * Null-returning fetch that doesn't throw on 401
 */
export async function fetchOptionalAuth(url: string): Promise<any> {
  return fetchWithAuth(url, false);
}

// Client-side only code to avoid module resolution issues
let _queryClient: any = null;

// This function should be called in client code to initialize the query client
export function initQueryClient() {
  if (typeof window !== 'undefined') {
    // Only run in the browser
    const { QueryClient } = require('@tanstack/react-query');
    _queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          refetchInterval: false,
          refetchOnWindowFocus: false,
          staleTime: Infinity,
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });
  }
  return _queryClient;
}

// Export the client instance for other modules to use
export const queryClient = typeof window !== 'undefined' ? initQueryClient() : null;
