# Cross-MFE Communication: EventBus vs Shared State Management

## Decision

Use a **custom EventBus** (pub/sub over `window.CustomEvent`) for cross-microfrontend communication instead of shared state management libraries like Redux or Zustand.

## Status

**Accepted**

---

## Context

Micro-frontends need to communicate across boundaries — for example, the Product Catalog tells the Cart that an item was added, or the Auth service notifies all MFEs of a login. The two main approaches are:

1. **Event-driven (pub/sub)** — MFEs emit and listen for typed events
2. **Shared state store** — All MFEs read/write to a single Redux or Zustand store

---

## Comparison

| Aspect | EventBus (chosen) | Redux (shared store) | Zustand (shared store) |
|--------|-------------------|---------------------|----------------------|
| **Coupling** | Loose — only the event contract is shared | Tight — all MFEs share the same store instance | Moderate — shared store, simpler API |
| **MFE independence** | Fully independent; can deploy/remove without breaking others | All MFEs depend on a shared Redux instance; removing one can leave orphaned reducers | Same issue as Redux, less boilerplate |
| **Singleton risk** | None — uses native browser APIs | Must guarantee a single store across MF boundaries (tricky with Module Federation) | Must share as singleton via MF `shared` config |
| **Cross-MFE data flow** | Fire-and-forget notifications; consumers react independently | Any MFE can read/write any slice; implicit dependencies emerge | Same as Redux |
| **Debugging** | `enableDebug()` traces events in console; no DevTools extension | Redux DevTools — excellent time-travel debugging | Limited DevTools support |
| **Type safety** | `EventPayloadMap` + Zod runtime validation in dev | TypeScript-typed slices, no runtime validation | Same as Redux |
| **Performance** | O(1) dispatch via native DOM events; no re-renders in unrelated MFEs | Global store changes can trigger re-renders across MFEs if selectors aren't precise | Better than Redux — subscriptions are selector-based by default |
| **Persistence** | Manual (e.g., `localStorage` for cart) | Redux Persist middleware | Zustand `persist` middleware (built-in) |
| **Learning curve** | Minimal — `emit`/`on`/`off` | High — actions, reducers, middleware, selectors, store config | Low — hook-based API |
| **Bundle size** | ~0 KB (native browser API) | ~7 KB (redux + react-redux) per MFE if not shared | ~1.5 KB |

---

## Why EventBus

### 1. MFE Autonomy
The primary goal of micro-frontends is independent deployability. A shared Redux store creates a hidden monolith — all MFEs coupled to one state shape. The EventBus keeps the contract surface minimal (`EventPayloadMap` — a handful of typed events).

### 2. No Singleton Coordination
Redux/Zustand must be a shared singleton across Module Federation boundaries. If two MFEs bundle different versions, you get duplicate stores and state splits. The EventBus uses `window.CustomEvent` — no version conflicts possible.

### 3. Failure Isolation
If the Auth MFE goes down, other MFEs simply stop receiving `auth:login` events and continue functioning. With a shared store, a failing MFE's reducer could corrupt the entire store.

### 4. Scalability
Adding a new MFE means defining new events in `eventContracts.ts`. With Redux, you'd need to merge reducers, coordinate action namespaces, and ensure no state collisions.

### 5. Zero Dependencies
The EventBus is built on `window.CustomEvent` — a native browser API. No third-party library, no version to manage, no bundle size impact.

---

## When Shared State Would Be Warranted

| Scenario | Recommendation |
|----------|---------------|
| Complex derived state across multiple MFEs (e.g., cart total depends on user's loyalty tier) | Thin Zustand store shared via Module Federation for **read-only** cross-cutting state |
| Real-time collaborative features | Shared state with WebSocket sync |
| Deep undo/redo across MFEs | Redux with time-travel |

---

## Hybrid Pattern (Future Option)

If cross-cutting read state becomes necessary, combine both approaches:
