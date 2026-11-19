import { z } from 'zod';

export const productsSchema = z.array(
  z.object({ id: z.string(), name: z.string(), price: z.number().nonnegative() }),
);
export type Product = z.infer<typeof productsSchema>[number];

export type ProductsState = {
  products: Product[] | undefined;
  loading: boolean;
  error: Error | null;
  retry: () => void;
};
