# ADR: Routing Strategy for Microfrontends

**Status:** Accepted  
**Date:** 2026-06-16  
**Context:** As remote MFEs grow in complexity, they will need nested routes (e.g., `/products/:id`, `/checkout/confirmation`). Two `<BrowserRouter>` instances in the same DOM is invalid — React Router throws "You cannot render a `<Router>` inside another `<Router>`". We need a strategy for how remotes handle sub-routing without conflicting with the shell.

---

## Decision

**Single `<BrowserRouter>` in the shell; remotes use `<Routes>` directly (no Router wrapper).** React Router's `singleton: true` shared config ensures all MFEs share the same router context. Shell delegates sub-paths to remotes via wildcard routes (`/*`).

---

## Architecture

```
Shell (owns the only <BrowserRouter>)
├── <Route path="/" element={<Landing />} />
├── <Route path="/products/*" element={<ProductCatalog />} />   ← wildcard
│       └── Remote's <Routes>
│           ├── <Route index />                → /products
│           ├── <Route path=":productId" />    → /products/abc123
│           └── <Route path="category/:slug" />→ /products/category/electronics
├── <Route path="/cart" element={<Cart />} />
└── <Route path="/checkout/*" element={<Checkout />} />         ← wildcard
        └── Remote's <Routes>
            ├── <Route index />                → /checkout
            └── <Route path="confirmation" /> → /checkout/confirmation
```

---

## Rules

1. **Only ONE `<BrowserRouter>`** — always in the shell's `App.tsx`
2. **`react-router-dom` must be `singleton: true`** in Module Federation shared config (already enforced)
3. **Remotes use `<Routes>` directly** — no Router wrapper in the exported component
4. **Shell uses wildcard paths** (`path="/products/*"`) for any remote that has sub-routes
5. **Standalone bootstrap provides its own Router** — only for dev mode, never in the exposed module

---

## Implementation

### Shell (host)

```tsx
// packages/shell/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/products/*" element={<ProductCatalog />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout/*" element={<Checkout />} />
    </Routes>
  </BrowserRouter>
);
```

### Remote with nested routes

```tsx
// packages/product-catalog/src/ProductCatalog.tsx
// NO BrowserRouter — inherits shell's router context
import { Routes, Route } from 'react-router-dom';

const ProductCatalog: React.FC = () => (
  <Routes>
    <Route index element={<ProductList />} />
    <Route path=":productId" element={<ProductDetail />} />
    <Route path="category/:slug" element={<ProductCategory />} />
  </Routes>
);

export default ProductCatalog;
```

### Remote without nested routes (no change needed)

```tsx
// packages/cart/src/Cart.tsx
// Simple component — no <Routes> needed
const Cart: React.FC = () => (
  <div>...</div>
);
```

### Standalone bootstrap (dev only)

```tsx
// packages/product-catalog/src/bootstrap.tsx
import { BrowserRouter } from 'react-router-dom';
import ProductCatalog from './ProductCatalog';

// This Router is ONLY used when running standalone (npm run start:product-catalog)
// When consumed as a remote, bootstrap is bypassed entirely
ReactDOM.createRoot(root).render(
  <BrowserRouter basename="/products">
    <ProductCatalog />
  </BrowserRouter>
);
```

---

## Why Not MemoryRouter in Remotes?

| Factor | Shared Router (chosen) | MemoryRouter in remote |
|--------|----------------------|----------------------|
| URL reflects nested route | Yes — `/products/abc123` visible | No — URL stays at `/products` |
| Browser back/forward | Works naturally | Broken — MemoryRouter has isolated history |
| Deep linking / sharing URLs | Works | Broken — refresh loses state |
| Shell sees remote's route | Yes — `useLocation()` works everywhere | No — shell can't observe MemoryRouter |
| SEO / SSR compatibility | Yes | No |
| Complexity | Low — just add `/*` | High — must sync URL ↔ memory manually |

**MemoryRouter is only appropriate for:** embedded widgets, multi-step modals, or wizards where you explicitly don't want the URL to change.

---

## Navigation Between MFEs

Remotes can navigate to other MFEs using React Router's `useNavigate()` since they share the same context:

```tsx
// Inside ProductCatalog remote
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/cart');  // Navigates to Cart MFE — works because same Router context
```

**Avoid** `window.location.href = '/cart'` — this causes a full page reload, losing SPA state. Use `useNavigate()` instead.

---

## Module Federation Shared Config (already in place)

```js
// All webpack.config.js files
shared: {
  'react-router-dom': { singleton: true, strictVersion: true, requiredVersion: '^6.23.1' },
}
```

This guarantees:
- All MFEs use the same `react-router-dom` instance
- Hooks like `useNavigate()`, `useParams()`, `useLocation()` share context
- Route matching works across MFE boundaries

---

## Verification Checklist

- [ ] Shell route uses `/*` wildcard for remotes with sub-routes
- [ ] Remote's exported component has NO `<BrowserRouter>` wrapper
- [ ] Remote's bootstrap.tsx wraps in `<BrowserRouter>` for standalone dev
- [ ] `useNavigate()` works from remote to navigate to another MFE's route
- [ ] Browser back/forward traverses remote's nested routes correctly
- [ ] Direct URL access (deep link) loads the correct nested route
- [ ] `react-router-dom` is `singleton: true` + `strictVersion: true` in all webpack configs

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Remote accidentally wraps in `<BrowserRouter>` | Lint rule or PR review convention; error is loud and immediate |
| Shell forgets `/*` wildcard | Remote's nested routes silently don't match — add integration test |
| Router version mismatch | `strictVersion: true` throws at runtime; error boundary catches it |
| Standalone dev uses different basename | Use `basename="/products"` in bootstrap to match shell's route prefix |
| `window.location.href` used instead of `useNavigate()` | Document convention; grep CI check for `location.href` in remote components |
