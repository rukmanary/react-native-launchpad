import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { productsSchema, type ProductsState } from '@/features/catalog/api/schema';

const productsQuery = gql`
  query StarterProducts {
    products {
      id
      name
      price
    }
  }
`;

export function useProducts(): ProductsState {
  const query = useQuery<{ products: unknown }>(productsQuery);
  const parsed = query.data ? productsSchema.safeParse(query.data.products) : undefined;

  return {
    products: parsed?.data,
    loading: query.loading,
    error: query.error ?? parsed?.error ?? null,
    retry: () => {
      void query.refetch().catch(() => undefined);
    },
  };
}
