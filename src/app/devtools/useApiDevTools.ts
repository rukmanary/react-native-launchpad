import { useTanStackQueryDevTools } from '@rozenite/tanstack-query-plugin';
import { queryClient } from '@/app/providers/query';

export function useApiDevTools() {
  useTanStackQueryDevTools(queryClient);
}
