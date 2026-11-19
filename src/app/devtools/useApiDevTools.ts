import { useTanStackQueryDevTools } from '@rozenite/tanstack-query-plugin';
import { queryClient } from '../providers/query';

export function useApiDevTools() {
  useTanStackQueryDevTools(queryClient);
}
