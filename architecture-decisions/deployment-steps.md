# Vercel Deployment Steps

## Prerequisites

- GitHub repo pushed: [Varun-Kelkar/react-microfrontends](https://github.com/Varun-Kelkar/react-microfrontends)
- Free Vercel account at [vercel.com](https://vercel.com)

---

## Step 1: Create 6 Vercel Projects

Go to [vercel.com/new](https://vercel.com/new) and import the same GitHub repo **6 times**, once per microfrontend. Deploy in this order:

### 1.1 — ui-kit (deploy first, no dependencies)

| Setting | Value |
|---------|-------|
| Project Name | `mfe-demo-ui-kit` |
| Root Directory | `packages/ui-kit` |
| Framework Preset | Other |
| Build Command | `cd ../.. && npm ci && npm run build --workspace=packages/ui-kit` |
| Output Directory | `dist` |
| Node.js Version | 20.x |

### 1.2 — product-catalog

| Setting | Value |
|---------|-------|
| Project Name | `mfe-demo-product-catalog` |
| Root Directory | `packages/product-catalog` |
| Framework Preset | Other |
| Build Command | `cd ../.. && npm ci && npm run build --workspace=packages/product-catalog` |
| Output Directory | `dist` |
| Node.js Version | 20.x |

### 1.3 — cart

| Setting | Value |
|---------|-------|
| Project Name | `mfe-demo-cart` |
| Root Directory | `packages/cart` |
| Framework Preset | Other |
| Build Command | `cd ../.. && npm ci && npm run build --workspace=packages/cart` |
| Output Directory | `dist` |
| Node.js Version | 20.x |

### 1.4 — checkout

| Setting | Value |
|---------|-------|
| Project Name | `mfe-demo-checkout` |
| Root Directory | `packages/checkout` |
| Framework Preset | Other |
| Build Command | `cd ../.. && npm ci && npm run build --workspace=packages/checkout` |
| Output Directory | `dist` |
| Node.js Version | 20.x |

### 1.5 — auth

| Setting | Value |
|---------|-------|
| Project Name | `mfe-demo-auth` |
| Root Directory | `packages/auth` |
| Framework Preset | Other |
| Build Command | `cd ../.. && npm ci && npm run build --workspace=packages/auth` |
| Output Directory | `dist` |
| Node.js Version | 20.x |

### 1.6 — shell (deploy last, depends on all remotes)

| Setting | Value |
|---------|-------|
| Project Name | `mfe-demo-shell` |
| Root Directory | `packages/shell` |
| Framework Preset | Other |
| Build Command | `cd ../.. && npm ci && npm run build --workspace=packages/shell` |
| Output Directory | `dist` |
| Node.js Version | 20.x |

> **Why `cd ../..`?** Vercel starts in the Root Directory (`packages/shell`). The `cd ../..` navigates to the repo root where `package-lock.json` and workspace config live. `npm ci` does a clean install of all workspace dependencies from there.

---

## Step 2: Note Deployed URLs

After each project's first deploy, Vercel assigns a production URL. Note them down:

| Project | Example URL |
|---------|-------------|
| ui-kit | `https://mfe-demo-ui-kit.vercel.app` |
| product-catalog | `https://mfe-demo-product-catalog.vercel.app` |
| cart | `https://mfe-demo-cart.vercel.app` |
| checkout | `https://mfe-demo-checkout.vercel.app` |
| auth | `https://mfe-demo-auth.vercel.app` |
| shell | `https://mfe-demo-shell.vercel.app` |

> Your actual URLs may differ if the project names are taken. Use whatever Vercel assigns.

---

## Step 3: Set Environment Variables

Go to each project → **Settings** → **Environment Variables** and add:

### On `mfe-demo-shell`:

| Key | Value |
|-----|-------|
| `UI_KIT_URL` | `https://mfe-demo-ui-kit.vercel.app` |
| `PRODUCT_CATALOG_URL` | `https://mfe-demo-product-catalog.vercel.app` |
| `CART_URL` | `https://mfe-demo-cart.vercel.app` |
| `CHECKOUT_URL` | `https://mfe-demo-checkout.vercel.app` |
| `AUTH_URL` | `https://mfe-demo-auth.vercel.app` |
| `CLERK_PUBLISHABLE_KEY` | `pk_live_...` (from Clerk production instance) |

### On `mfe-demo-cart`:

| Key | Value |
|-----|-------|
| `UI_KIT_URL` | `https://mfe-demo-ui-kit.vercel.app` |

### On `mfe-demo-checkout`:

| Key | Value |
|-----|-------|
| `UI_KIT_URL` | `https://mfe-demo-ui-kit.vercel.app` |

### On `mfe-demo-product-catalog`:

| Key | Value |
|-----|-------|
| `UI_KIT_URL` | `https://mfe-demo-ui-kit.vercel.app` |

### On `mfe-demo-auth`:

| Key | Value |
|-----|-------|
| `UI_KIT_URL` | `https://mfe-demo-ui-kit.vercel.app` |
| `CLERK_PUBLISHABLE_KEY` | `pk_live_...` (from Clerk production instance) |

### On `mfe-demo-ui-kit`:

No environment variables needed (no remote dependencies).

---

## Step 4: Redeploy All Projects

After setting env vars, redeploy each project so the builds pick up the new URLs:

1. Go to each project → **Deployments** tab
2. Click the **⋮** menu on the latest deployment
3. Select **Redeploy**

Redeploy in order: `ui-kit` → `product-catalog`, `cart`, `checkout`, `auth` → `shell`

---

## Step 5: Verify

1. Open the shell URL (e.g. `https://mfe-demo-shell.vercel.app`)
2. Confirm all microfrontends render (products, cart, checkout)
3. Open browser DevTools → **Network** tab → filter for `remoteEntry.js`
   - You should see 5 requests to the remote URLs (ui-kit, product-catalog, cart, checkout, auth)
4. Check **Console** tab — no CORS errors
5. Navigate to a route like `/cart` and **hard refresh** — should not 404
6. Click **Sign In** → Clerk sign-in page renders with Google/GitHub OAuth buttons
7. Complete OAuth flow → redirects back, user avatar appears in header
8. Navigate to `/checkout` while signed out → redirects to `/sign-in`
9. Navigate to `/profile` while signed in → Clerk profile page renders

---

## Optional: Ignored Build Step

To avoid wasting build minutes on unrelated commits, configure per project:

1. Go to project → **Settings** → **Git** → **Ignored Build Step**
2. Set to **Custom** and enter:

| Project | Command |
|---------|---------|
| shell | `git diff --quiet HEAD^ HEAD -- packages/shell/ packages/shared/` |
| ui-kit | `git diff --quiet HEAD^ HEAD -- packages/ui-kit/ packages/shared/` |
| cart | `git diff --quiet HEAD^ HEAD -- packages/cart/ packages/shared/` |
| checkout | `git diff --quiet HEAD^ HEAD -- packages/checkout/ packages/shared/` |
| product-catalog | `git diff --quiet HEAD^ HEAD -- packages/product-catalog/ packages/shared/` |
| auth | `git diff --quiet HEAD^ HEAD -- packages/auth/ packages/shared/` |

This tells Vercel to skip the build if none of the relevant files changed.

---

## Troubleshooting

### Build fails with "npm ci" error
Make sure `package-lock.json` is committed and pushed to GitHub. Vercel needs it at the repo root.

### CORS errors in browser console
Verify `vercel.json` exists in the package directory and includes the `Access-Control-Allow-Origin: *` header config.

### Shell shows loading errors for remotes
Check that env vars are set correctly on the shell project and that you redeployed after adding them.

### 404 on page refresh (shell only)
Verify `vercel.json` in `packages/shell` has the SPA rewrite rule that sends non-asset routes to `/index.html`.

### remoteEntry.js not found
Confirm each remote package's webpack config has `filename: 'remoteEntry.js'` in the ModuleFederationPlugin config.

### Clerk "Missing publishableKey" error
Ensure `CLERK_PUBLISHABLE_KEY` is set on both `mfe-demo-shell` and `mfe-demo-auth` Vercel projects, and that you redeployed after adding it. Use the **production** key (`pk_live_...`), not the test key.

### Clerk OAuth redirects fail
In your Clerk production instance dashboard, add your production shell URL (e.g. `https://mfe-demo-shell.vercel.app`) to the allowed redirect URLs. Also ensure Google and GitHub OAuth providers are enabled in Clerk under **User & Authentication → Social Connections**.

---

## Clerk Production Setup

Before deploying with auth, complete these Clerk dashboard steps:

1. **Create a production instance** at [dashboard.clerk.com](https://dashboard.clerk.com)
2. **Enable OAuth providers**: User & Authentication → Social Connections → Enable **Google** and **GitHub**
3. **Configure redirect URLs**: Add your production shell URL under Paths → Redirect URLs
4. **Copy the production publishable key** (`pk_live_...`) and set it as `CLERK_PUBLISHABLE_KEY` env var on Vercel
5. **Do NOT use `pk_test_*` keys in production** — they bypass email verification and have relaxed security
