# ADR: Event Contract Validation (TypeScript Generics + Optional Zod)

**Status:** Proposed  
**Date:** 2026-06-16  
**Context:** Event names are raw string constants with no schema validation across MFE boundaries. A typo in an event name compiles fine, payload shapes can drift between emitter and consumer with no error, and there's no dev-time feedback when a contract is violated.

---

## Decision

Replace the untyped `EventBus.emit(string, unknown)` API with a **type-safe, schema-validated** event system:
- **TypeScript generics** enforce payload shapes at compile time
- **Optional Zod schemas** validate at runtime (strict errors in dev, silent warnings in prod)
- **Non-breaking migration** — existing `EVENTS` constant remains functional (deprecated)

---

## Current Event Contract

| Event | Emitter | Payload | Consumers |
|-------|---------|---------|-----------|
| `cart:add-item` | ProductCatalog | `{ product: Product, quantity: number }` | Cart, CartBadge, Header |
| `cart:remove-item` | Cart | `{ productId: string }` | CartBadge, Header |
| `cart:update-quantity` | Cart | `{ productId: string, delta: number }` | CartBadge |
| `cart:clear` | Checkout | `null` | CartBadge, Header |
| `auth:login` | *(unused)* | — | *(none)* |
| `auth:logout` | *(unused)* | — | *(none)* |

### Problems

- Payload shapes are implicit — nothing enforces them
- Event names are `string` type — typos compile fine
- Consumers mostly reload from localStorage rather than using the event payload, masking drift
- Dead events (`auth:login`, `auth:logout`) exist with no emitter or consumer

---

## Implementation Plan

### Phase 1: Typed Event Registry (compile-time safety)

**Step 1.** Create `packages/shared/src/eventContracts.ts`:

```ts
import { Product } from './types';

// Single source of truth — every event MUST be registered here
export interface EventPayloadMap {
  'cart:add-item': { product: Product; quantity: number };
  'cart:remove-item': { productId: string };
  'cart:update-quantity': { productId: string; delta: number };
  'cart:clear': null;
  'auth:login': { userId: string; name: string };
  'auth:logout': null;
}

// Derived union type of all valid event names
export type EventName = keyof EventPayloadMap;
```

**Step 2.** Refactor `EventBus` with generics constrained to `EventPayloadMap`:

```ts
import { EventPayloadMap, EventName } from './eventContracts';

export const EventBus = {
  emit<K extends EventName>(eventName: K, payload: EventPayloadMap[K]): void {
    // ... validation + dispatch
  },

  on<K extends EventName>(
    eventName: K,
    handler: (event: CustomEvent<EventPayloadMap[K]>) => void
  ): void {
    // ... subscribe
  },

  off<K extends EventName>(
    eventName: K,
    handler: (event: CustomEvent<EventPayloadMap[K]>) => void
  ): void {
    // ... unsubscribe
  },
};
```

**Compile-time guarantees:**
- `EventBus.emit('cart:typo', {})` → TypeScript error (not in `EventPayloadMap`)
- `EventBus.emit('cart:add-item', { wrong: true })` → TypeScript error (missing `product`, `quantity`)
- `EventBus.on('cart:add-item', (e) => e.detail.product)` → fully typed payload

**Step 3.** Derive `EVENTS` from `EventPayloadMap` keys (backward compatible):

```ts
export const EVENTS: { [K in Uppercase<string>]: EventName } = {
  CART_ADD_ITEM: 'cart:add-item',
  CART_REMOVE_ITEM: 'cart:remove-item',
  CART_UPDATE_QUANTITY: 'cart:update-quantity',
  CART_CLEAR: 'cart:clear',
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
} as const satisfies Record<string, EventName>;
```

---

### Phase 2: Zod Runtime Schemas (runtime safety)

**Step 4.** Add `zod` dependency to `packages/shared`:

```bash
npm install zod --workspace=packages/shared
```

**Step 5.** Create `packages/shared/src/eventSchemas.ts`:

```ts
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
  'auth:login': z.object({ userId: z.string(), name: z.string() }),
  'auth:logout': z.null(),
} as const;
```

**Step 6.** Integrate validation into `EventBus.emit()`:

```ts
emit<K extends EventName>(eventName: K, payload: EventPayloadMap[K]): void {
  if (__DEV__) {
    const schema = eventSchemas[eventName];
    if (schema) {
      const result = schema.safeParse(payload);
      if (!result.success) {
        throw new Error(
          `[EventBus] Invalid payload for "${eventName}":\n${result.error.message}`
        );
      }
    }
  } else {
    // Production: warn, don't block
    const schema = eventSchemas[eventName];
    if (schema) {
      const result = schema.safeParse(payload);
      if (!result.success) {
        console.warn(`[EventBus] Payload mismatch for "${eventName}"`, result.error.issues);
      }
    }
  }

  const event = new CustomEvent(eventName, { detail: payload });
  window.dispatchEvent(event);
}
```

**Step 7.** Define `__DEV__` in each webpack.config.js via `DefinePlugin`:

```js
const webpack = require('webpack');

// Inside plugins array:
new webpack.DefinePlugin({
  __DEV__: JSON.stringify(argv.mode !== 'production'),
})
```

---

### Phase 3: Tree-shake Zod in Production

**Step 8.** Conditionally load schemas to achieve zero prod bundle cost:

```ts
// eventBus.ts
let schemas: typeof import('./eventSchemas').eventSchemas | null = null;

if (__DEV__) {
  schemas = require('./eventSchemas').eventSchemas;
}
```

Webpack dead-code-eliminates the `require` when `__DEV__` is `false`, so Zod never ships to production.

---

### Phase 4: Migrate Consumers

**Step 9.** Deprecate the old `EVENTS` constant:

```ts
/**
 * @deprecated Use EventBus.emit('cart:add-item', payload) with typed event names directly.
 * Will be removed in v2.0.
 */
export const EVENTS = { ... } as const;
```

**Step 10.** Update all emit/on call sites:

| File | Before | After |
|------|--------|-------|
| `product-catalog/ProductCatalog.tsx` | `EventBus.emit(EVENTS.CART_ADD_ITEM, {...})` | `EventBus.emit('cart:add-item', { product, quantity: 1 })` |
| `cart/Cart.tsx` | `EventBus.emit(EVENTS.CART_REMOVE_ITEM, {...})` | `EventBus.emit('cart:remove-item', { productId })` |
| `cart/Cart.tsx` | `EventBus.emit(EVENTS.CART_UPDATE_QUANTITY, {...})` | `EventBus.emit('cart:update-quantity', { productId, delta })` |
| `checkout/Checkout.tsx` | `EventBus.emit(EVENTS.CART_CLEAR, null)` | `EventBus.emit('cart:clear', null)` |
| `cart/CartBadge.tsx` | `EventBus.on(EVENTS.CART_ADD_ITEM, handler)` | `EventBus.on('cart:add-item', handler)` |
| `shell/Header.tsx` | `EventBus.on(EVENTS.CART_ADD_ITEM, handler)` | `EventBus.on('cart:add-item', handler)` |

---

### Phase 5: Dev Tooling & Observability

**Step 11.** Add debug mode:

```ts
let debugEnabled = false;

export const EventBus = {
  enableDebug(): void { debugEnabled = true; },
  disableDebug(): void { debugEnabled = false; },

  emit<K extends EventName>(eventName: K, payload: EventPayloadMap[K]): void {
    if (debugEnabled) {
      console.log(
        `%c[EventBus] ${eventName}`,
        'color: #3b82f6; font-weight: bold',
        payload,
        new Date().toISOString()
      );
    }
    // ... validation + dispatch
  },
};
```

**Step 12.** (Optional) Create a `useEventBusDevTools()` hook that renders a floating overlay showing the live event stream — useful for debugging cross-MFE communication during development.

---

## Files Modified

| File | Change |
|------|--------|
| `packages/shared/src/eventContracts.ts` | NEW — type registry (EventPayloadMap) |
| `packages/shared/src/eventSchemas.ts` | NEW — Zod schemas |
| `packages/shared/src/eventBus.ts` | Refactor — typed generics + runtime validation |
| `packages/shared/src/index.ts` | Export new modules |
| `packages/shared/package.json` | Add zod dependency |
| `packages/product-catalog/src/ProductCatalog.tsx` | Update emit calls |
| `packages/cart/src/Cart.tsx` | Update emit/on calls |
| `packages/cart/src/CartBadge.tsx` | Update on calls |
| `packages/checkout/src/Checkout.tsx` | Update emit calls |
| `packages/shell/src/components/Header.tsx` | Update on calls |
| `packages/*/webpack.config.js` | Add DefinePlugin for `__DEV__` |

---

## Verification Checklist

- [ ] **Compile-time**: Wrong payload type → TypeScript error
- [ ] **Compile-time**: Unregistered event name → TypeScript error
- [ ] **Dev runtime**: Missing required field → error thrown with descriptive message
- [ ] **Prod runtime**: Wrong payload → `console.warn` only, event still dispatches
- [ ] **Unit tests**: Schema validation for each event in shared package
- [ ] **Integration**: `npm start` → add-to-cart, checkout flows unaffected
- [ ] **Bundle size**: Zod NOT present in production bundle (verify with webpack-bundle-analyzer)
- [ ] **Debug mode**: `EventBus.enableDebug()` logs all events in console

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Zod adds bundle size | Tree-shaken via `__DEV__` conditional; zero bytes in prod |
| Breaking change for existing consumers | Non-breaking: old `EVENTS` constant still works (deprecated) |
| Schema drift from TypeScript types | Derive both from same `EventPayloadMap`; add CI check that Zod schemas match TS types |
| Runtime validation slows dev | `safeParse` is fast (~0.1ms per call); negligible for UI events |
| New events require updating two files | Document convention; lint rule ensures every `EventPayloadMap` entry has a Zod schema |

---

## Future Considerations

- **Auto-generate Zod from TypeScript**: Use `ts-to-zod` to auto-generate `eventSchemas.ts` from `eventContracts.ts`, eliminating manual sync.
- **Event versioning**: If payload shapes need to evolve, add version field (`'cart:add-item:v2'`) or use a version discriminator in the payload.
- **Cross-tab event sync**: Combine with `BroadcastChannel` API to relay events across browser tabs.
- **Contract testing in CI**: Add a test that imports all Zod schemas and validates sample payloads, run on every PR.
- **OpenTelemetry integration**: Trace event emissions across MFEs for observability in production.
