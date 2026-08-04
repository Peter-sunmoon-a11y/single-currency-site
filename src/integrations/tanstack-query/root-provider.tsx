import { HydrationBoundary, QueryClient, QueryClientProvider, type DehydratedState } from "@tanstack/react-query";
import type { ReactNode } from "react";

type ProviderProps = {
  children: ReactNode;
  dehydratedState?: DehydratedState;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401) {
          return false;
        }
        if ([403, 404].includes(error?.response?.status)) {
          return false;
        }
        if (!error?.response && error?.message === "Network Error") {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 30 * 60 * 1000,
    },
    mutations: {
      retry: false,
    },
  }
});

export function Provider({ children, dehydratedState }: ProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
    </QueryClientProvider>
  );
}
