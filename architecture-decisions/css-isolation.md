# ADR: CSS Isolation via Namespace Wrappers + Deduplication + Dark Mode

**Status:** Proposed  
**Date:** 2026-06-16  
**Context:** All 5 MFEs inject full `@tailwind base/components/utilities` globally with no scoping — causing duplicate CSS, potential reset-style conflicts, and no protection against custom CSS leaking across boundaries. Dark mode is only configured in the shell.

---

## Decision

Use **namespace wrapper divs** (`.mfe-{name}`) for CSS isolation, eliminate duplicate `@tailwind base` from remotes, and propagate `darkMode: 'class'` to all MFEs.

### Why Namespace Wrappers Over Alternatives

| Approach | Rejected Because |
|----------|-----------------|
| Shadow DOM | Breaks Tailwind's global utility model; shared theme tokens can't cascade in |
| Tailwind `prefix` (e.g., `tw-`) | Requires rewriting every `className` across all components — massive refactor |
| CSS-in-JS (styled-components) | Adds runtime overhead; incompatible with current Tailwind-first approach |
| CSS Modules | Only useful for custom CSS, not Tailwind utilities — partial solution |

Namespace wrappers give scoping for custom CSS while allowing Tailwind utilities to work naturally via CSS inheritance from the host document.

---

## Implementation Plan

### Phase 1: Namespace Wrapper Infrastructure

1. **Create** `packages/shared/src/MfeContainer.tsx`:
   ```tsx
   import React from 'react';

   interface MfeContainerProps {
     name: string;
     children: React.ReactNode;
   }

   export const MfeContainer: React.FC<MfeContainerProps> = ({ name, children }) => (
     <div className={`mfe-${name}`} data-mfe={name}>
       {children}
     </div>
   );
   ```

2. **Export** from `packages/shared/src/index.ts`

3. **Wrap** each remote's top-level exported component:
   - `packages/cart/src/Cart.tsx` → `<MfeContainer name="cart">`
   - `packages/product-catalog/src/ProductCatalog.tsx` → `<MfeContainer name="product-catalog">`
   - `packages/checkout/src/Checkout.tsx` → `<MfeContainer name="checkout">`

4. **Update** standalone bootstrap files to also use `MfeContainer` so standalone dev matches integrated behavior.

---

### Phase 2: Eliminate Duplicate Base Styles

5. **Remove** `@tailwind base` from all remote `styles.css` files:
   - `packages/cart/src/styles.css`
   - `packages/product-catalog/src/styles.css`
   - `packages/checkout/src/styles.css`
   - `packages/ui-kit/src/styles.css`

   Only `packages/shell/src/styles.css` retains `@tailwind base` (shell always loads first as host).

6. **For standalone dev**, create `styles-standalone.css` in each remote with `@tailwind base`, imported only in `bootstrap.tsx` (not in the exposed module). This ensures remotes work independently during development.

---

### Phase 3: CSS Deduplication via Module Federation

7. **Add** shared config to Module Federation in each webpack.config.js:
   ```js
   shared: {
     '@mfe-demo/shared': { singleton: true },
     react: { singleton: true, requiredVersion: '^18.3.1' },
     'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
   }
   ```

8. **Expand** shell's Tailwind `content` paths to scan all packages:
   ```ts
   content: [
     './src/**/*.{ts,tsx}',
     '../cart/src/**/*.{ts,tsx}',
     '../product-catalog/src/**/*.{ts,tsx}',
     '../checkout/src/**/*.{ts,tsx}',
     '../ui-kit/src/**/*.{ts,tsx}',
   ]
   ```
   Shell generates the superset of Tailwind utilities; remotes generate only what's unique to them.

---

### Phase 4: Dark Mode Propagation

9. **Add** `darkMode: 'class'` to all remote `tailwind.config.ts` files:
   - `packages/cart/tailwind.config.ts`
   - `packages/checkout/tailwind.config.ts`
   - `packages/product-catalog/tailwind.config.ts`
   - `packages/ui-kit/tailwind.config.ts`

10. No extra plumbing needed — since wrappers are plain `<div>`s (not Shadow DOM), CSS `dark:` variants inherit from `<html class="dark">` toggled by shell's `ThemeToggle`.

---

### Phase 5: Scoped Custom CSS Convention

11. **Convention**: Any non-Tailwind custom CSS in a remote MUST be scoped under `.mfe-{name}`:
    ```css
    /* packages/cart/src/styles.css */
    .mfe-cart .cart-slide-animation {
      animation: slideIn 0.3s ease;
    }
    ```

12. **(Optional enforcement)** Add `postcss-prefix-selector` to each remote's PostCSS config:
    ```js
    // packages/cart/postcss.config.mjs
    export default {
      plugins: {
        'postcss-prefix-selector': {
          prefix: '.mfe-cart',
          exclude: [/^\.dark/, /^@/],  // Don't prefix dark mode or at-rules
        },
        tailwindcss: {},
        autoprefixer: {},
      },
    };
    ```

---

## Files Modified

| File | Change |
|------|--------|
| `packages/shared/src/MfeContainer.tsx` | NEW — wrapper component |
| `packages/shared/src/index.ts` | Export MfeContainer |
| `packages/cart/src/Cart.tsx` | Wrap with MfeContainer |
| `packages/product-catalog/src/ProductCatalog.tsx` | Wrap with MfeContainer |
| `packages/checkout/src/Checkout.tsx` | Wrap with MfeContainer |
| `packages/*/src/styles.css` | Remove `@tailwind base` from remotes |
| `packages/*/src/styles-standalone.css` | NEW — base styles for standalone dev |
| `packages/*/tailwind.config.ts` | Add `darkMode: 'class'` |
| `packages/*/postcss.config.mjs` | Optionally add postcss-prefix-selector |
| `packages/*/webpack.config.js` | Shared config update |
| `packages/shell/tailwind.config.ts` | Expand content paths |

---

## Verification Checklist

- [ ] `npm start` — all MFEs together, no visual breakage
- [ ] DOM inspection: each remote wrapped in `.mfe-{name}` div with `data-mfe` attribute
- [ ] DevTools: only one `@tailwind base` reset loads (from shell)
- [ ] Toggle dark mode — all remote components respond to theme change
- [ ] Standalone `npm run start:cart` — works independently with base styles
- [ ] Add unscoped custom CSS in cart — confirm it does NOT bleed into product-catalog

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Removing `@tailwind base` breaks standalone dev | `styles-standalone.css` imported only in bootstrap |
| `postcss-prefix-selector` over-scopes Tailwind utilities | Exclude Tailwind-generated classes with regex; only scope custom CSS |
| Shell content paths become stale when new MFEs added | Document convention; consider glob patterns |
| Namespace div adds extra DOM node | Negligible performance impact; use `React.Fragment` fallback if needed |

---

## Future Considerations

- **Shared CSS CDN bundle**: For production, host a single pre-built Tailwind CSS file on CDN that all MFEs reference, eliminating per-MFE generation entirely.
- **Runtime CSS deduplication**: Tools like `critters` or atomic CSS extraction (e.g., UnoCSS) could deduplicate at build time.
- **Contract testing for styles**: Snapshot tests that verify each MFE's CSS doesn't exceed its namespace boundary.
