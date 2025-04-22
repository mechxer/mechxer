import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method,
  url,
  data
) {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

export const getQueryFn = ({ on401 }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0], {
      credentials: "include",
    });

    if (on401 === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

/**
 * Fetch data from the API with authentication handling
 */
export async function fetchWithAuth(url, throwOn401 = true) {
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
export async function fetchOptionalAuth(url) {
  return fetchWithAuth(url, false);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
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
