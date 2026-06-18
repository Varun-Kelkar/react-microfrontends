import { z } from 'zod';

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  image: z.string(),
  category: z.string(),
});

export const eventSchemas = {
  'cart:add-item': z.object({
    product: productSchema,
    quantity: z.number().int().positive(),
  }),
  'cart:remove-item': z.object({ productId: z.string() }),
  'cart:update-quantity': z.object({
    productId: z.string(),
    delta: z.number().int(),
  }),
  'cart:clear': z.null(),
  'auth:login': z.object({ userId: z.string(), name: z.string(), email: z.string().email() }),
  'auth:logout': z.null(),
} as const;
