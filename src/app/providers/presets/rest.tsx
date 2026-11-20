import { useEffect, type PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient, connectQueryLifecycle } from '@/app/providers/query';

export function ApiProvider({ children }: PropsWithChildren) {
  useEffect(connectQueryLifecycle, []);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export async function clearApiCache() {
  await queryClient.cancelQueries();
  queryClient.clear();
}
