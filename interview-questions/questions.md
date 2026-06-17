# Microfrontend Project — Interview Questions

## Architecture & Design Decisions

1. **Why did you choose Webpack Module Federation over alternatives like single-spa, import maps, or Vite's federation plugin?** What trade-offs did you consider?

2. **Walk me through what happens at runtime when a user navigates to `/products`.** How does the shell resolve and load `productCatalog/ProductCatalog`?

3. **Your shared dependencies (react, react-dom) are marked `singleton: true`.** What happens if one remote accidentally bundles React 19 while the shell pins React 18? How does `requiredVersion` behave at runtime?

4. **You're using `localStorage` as the cart persistence layer with an EventBus for cross-MFE sync.** What happens if two browser tabs are open — does the cart stay consistent? How would you solve that?

5. **The `remoteEntry.js` URLs are hardcoded to `localhost:300X`.** How would you handle dynamic remote URLs across environments (staging, production, canary)?

## Communication & State Management

6. **Your `EventBus` uses `CustomEvent` on `window`.** Why did you choose a pub/sub pattern over shared state (e.g., a shared Redux store or Zustand)? What are the debugging challenges with this approach?

7. **How do you ensure type safety across MFE boundaries?** I see `remotes.d.ts` files — how do you keep those in sync when a remote's exposed API changes?

8. **If the Cart MFE emits `CART_ADD_ITEM` but the ProductCatalog MFE has a typo in the event name, how would you catch that?** Is there a contract enforcement mechanism?

## Resilience & Error Handling

9. **Your `RemoteErrorBoundary` catches load failures gracefully.** But what about partial degradation — if only the `CartBadge` remote in the Header fails, does the entire Header unmount? How would you isolate that?

10. **What happens if `remoteEntry.js` takes 10 seconds to load due to network issues?** Do you have timeout handling, retry logic, or a prefetch strategy?

## Styling & Consistency

11. **You've built a shared Tailwind preset in `tailwind-preset.ts`.** How do you prevent CSS class collisions if two MFEs generate conflicting utility classes? Is there CSS isolation (Shadow DOM, scoped styles, CSS Modules)?

12. **If the ui-kit team ships a breaking change to `Button`, how does that propagate?** Is there versioning, or do all consumers always get the latest?

## DX & Deployment

13. **In production, how do you deploy one MFE without redeploying the shell?** Walk me through a deploy of just the Cart MFE.

14. **How would you add E2E testing for a user flow that spans shell → product-catalog → cart → checkout?** Who owns that test?

15. **The monorepo uses npm workspaces. Why not separate repos per MFE?** What are the pros/cons of your approach for team autonomy?

---

## Common Microfrontend Challenges & How This Project Addresses Them

| Challenge | How it's solved here |
|-----------|---------------------|
| **Shared dependency duplication** (bundling React N times) | Module Federation `shared` config with `singleton: true` ensures only one React instance loads at runtime |
| **Cross-MFE communication** without tight coupling | Custom `EventBus` using browser `CustomEvent` — loose coupling, no shared global store |
| **Type safety across boundaries** | Shared `types.ts` package and `remotes.d.ts` declarations in each consumer |
| **Independent deployability** | Each MFE has its own `webpack.config.js`, exposes a `remoteEntry.js`, and can be built/deployed separately |
| **Graceful degradation** when a remote is down | `RemoteErrorBoundary` catches load errors and shows a fallback UI |
| **Consistent UI/UX** across teams | Shared `ui-kit` MFE exposes reusable components (Button, Card, Modal, etc.) consumed via federation, plus a shared Tailwind preset for design tokens |
| **Routing ownership** | Shell owns top-level routes; each remote is loaded lazily via `React.lazy()` + `Suspense` |
| **Slow cold-start / loading UX** | `Suspense` with a spinner fallback while remote chunks download |
| **Monorepo coordination** | npm workspaces + `concurrently` for parallel dev servers; shared `tsconfig.base.json` for consistent TypeScript settings |

## Areas Open for Discussion / Improvement

- **No runtime contract testing** — event names are string constants with no schema validation across boundaries.
- **Hardcoded remote URLs** — no dynamic remote loading or service discovery.
- **No CSS isolation** — Tailwind utility classes could theoretically clash if MFEs use different Tailwind versions or custom utilities.
- **`localStorage` as state** — no cross-tab sync, no server-side persistence, race conditions possible.
- **No versioning on exposed modules** — a breaking change in `ui-kit/Button` immediately affects all consumers.
