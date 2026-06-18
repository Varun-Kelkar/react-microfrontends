import { Product } from './types';

/**
 * Single source of truth for all event payloads.
 * Every event MUST be registered here.
 */
export interface EventPayloadMap {
  'cart:add-item': { product: Product; quantity: number };
  'cart:remove-item': { productId: string };
  'cart:update-quantity': { productId: string; delta: number };
  'cart:clear': null;
  'auth:login': { userId: string; name: string; email: string };
  'auth:logout': null;
}

export type EventName = keyof EventPayloadMap;
