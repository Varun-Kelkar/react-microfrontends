# Deployment Strategy

## Decision

Deploy all 5 microfrontend packages as separate Vercel Hobby (free tier) projects, using default `*.vercel.app` subdomains. Each package is independently deployable from the same GitHub monorepo.

## Context

This application is a demo. Requirements:
- Free-tier hosting only
- No custom domain needed
- Independent deployment per microfrontend
- CORS support for cross-origin `remoteEntry.js` loading
- SPA routing support for the shell (host)

## Platform: Vercel (Hobby Plan)

- Unlimited projects
- 100 GB bandwidth/month
- Automatic deploys from GitHub
- Node.js 20 support
- Built-in CORS header configuration via `vercel.json`

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  mfe-demo-shell.vercel.app (Host)                       │
│  Loads remoteEntry.js from:                             │
│    ├── mfe-demo-ui-kit.vercel.app                       │
│    ├── mfe-demo-product-catalog.vercel.app              │
│    ├── mfe-demo-cart.vercel.app                         │
│    └── mfe-demo-checkout.vercel.app                     │
└─────────────────────────────────────────────────────────┘
```

Each remote is a static site serving its `dist/` folder, including `remoteEntry.js` at the root.

---

## Vercel Project Configuration

| Project | Root Directory | Port (dev) | Exposes |
|---------|---------------|------------|---------|
| `mfe-demo-shell` | `packages/shell` | 3000 | — (host) |
| `mfe-demo-ui-kit` | `packages/ui-kit` | 3001 | Button, Card, Input, Modal, Badge, Toast |
| `mfe-demo-product-catalog` | `packages/product-catalog` | 3002 | ProductCatalog |
| `mfe-demo-cart` | `packages/cart` | 3003 | Cart, CartBadge |
| `mfe-demo-checkout` | `packages/checkout` | 3004 | Checkout |

### Build Settings (all projects)

| Setting | Value |
|---------|-------|
| Framework Preset | Other |
| Build Command | `cd ../.. && npm ci && npm run build --workspace=packages/{name}` |
| Output Directory | `dist` |
| Install Command | _(leave empty — handled in build command)_ |
| Node.js Version | 20.x |

---

## Remote URL Parameterization

Webpack configs use `process.env.*` for remote URLs, resolved at build time with localhost fallback for local development:

```javascript
remotes: {
  uiKit: `uiKit@${process.env.UI_KIT_URL || 'http://localhost:3001'}/remoteEntry.js`,
  productCatalog: `productCatalog@${process.env.PRODUCT_CATALOG_URL || 'http://localhost:3002'}/remoteEntry.js`,
  cart: `cart@${process.env.CART_URL || 'http://localhost:3003'}/remoteEntry.js`,
  checkout: `checkout@${process.env.CHECKOUT_URL || 'http://localhost:3004'}/remoteEntry.js`,
}
```

This ensures `npm run start` locally still works unchanged.

---

## Environment Variables

### On `mfe-demo-shell`:
| Variable | Value |
|----------|-------|
| `UI_KIT_URL` | `https://mfe-demo-ui-kit.vercel.app` |
| `PRODUCT_CATALOG_URL` | `https://mfe-demo-product-catalog.vercel.app` |
| `CART_URL` | `https://mfe-demo-cart.vercel.app` |
| `CHECKOUT_URL` | `https://mfe-demo-checkout.vercel.app` |

### On `mfe-demo-cart`, `mfe-demo-checkout`, `mfe-demo-product-catalog`:
| Variable | Value |
|----------|-------|
| `UI_KIT_URL` | `https://mfe-demo-ui-kit.vercel.app` |

### On `mfe-demo-ui-kit`:
_(No remote dependencies — no env vars needed)_

---

## Deployment Order

```
1. ui-kit          (no dependencies)
2. product-catalog (depends on ui-kit)
   cart            (depends on ui-kit)    ← parallel
   checkout        (depends on ui-kit)
3. shell           (depends on all remotes)
```

After initial deploy, set env vars on each project and redeploy.

---

## CORS & Routing (`vercel.json`)

### Remote packages (ui-kit, cart, checkout, product-catalog):
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET" }
      ]
    }
  ]
}
```

### Shell (host):
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/((?!remoteEntry|assets|static).*)", "destination": "/index.html" }
  ]
}
```

The rewrite ensures SPA client-side routing works (refresh on `/cart` doesn't 404).

---

## Ignored Build Step (Optional — Saves Build Minutes)

Configure per project in Vercel Settings → Git → Ignored Build Step:

```bash
git diff --quiet HEAD^ HEAD -- packages/{name}/ packages/shared/
```

This skips redeploys when only unrelated packages changed.

---

## Verification Checklist

- [ ] `npm run start` locally still works (env vars fall back to localhost)
- [ ] Each Vercel project deploys and serves `remoteEntry.js` at root URL
- [ ] Shell loads all 4 remotes — verify in DevTools Network tab
- [ ] No CORS errors in browser console
- [ ] SPA routing works on shell (refresh on `/products` doesn't 404)
- [ ] Shared React singleton — only one React instance loaded (check `React.__SECRET_INTERNALS`)

---

## Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Vercel (5 projects)** | Free, auto-deploy, good DX | 5 projects to manage | ✅ Selected |
| Cloudflare Pages | Generous free tier, fast CDN | Less familiar, 500 builds/month | Rejected |
| Netlify | Good DX | 300 build minutes/month | Rejected |
| GitHub Pages | Free for public repos | 1 site per repo, no CORS headers config | Rejected |
| AWS S3 + CloudFront | Existing CI/CD in place | Not free tier friendly long-term | Rejected (kept as fallback) |

---

## Notes

- Existing AWS GitHub Actions workflows (`.github/workflows/`) are left in place but unused for this demo deployment.
- Preview deployments on PRs will point to production remote URLs (acceptable for demo).
- If Vercel project names are taken, adjust URLs and env vars accordingly.
