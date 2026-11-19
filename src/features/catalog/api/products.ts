import { z } from 'zod';
import { queryOptions } from '@tanstack/react-query';
import { api } from '../../../core/http/api';
const schema = z.array(
  z.object({ id: z.string(), name: z.string(), price: z.number().nonnegative() }),
);
export type Product = z.infer<typeof schema>[number];
export const productsQuery = () =>
  queryOptions({
    queryKey: ['products'],
    queryFn: ({ signal }) => api.request({ path: '/products', signal, schema }),
  });
