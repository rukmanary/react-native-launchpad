import { useQuery } from '@tanstack/react-query';
import { api } from '../../../core/http/api';
import { productsSchema, type ProductsState } from './schema';

export function useProducts(): ProductsState {
  const query = useQuery({
    queryKey: ['products'],
    queryFn: ({ signal }) => api.request({ path: '/products', signal, schema: productsSchema }),
  });

  return {
    products: query.data,
    loading: query.isPending,
    error: query.error,
    retry: () => {
      void query.refetch();
    },
  };
}
