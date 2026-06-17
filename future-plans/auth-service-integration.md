# Auth Service Integration — Clerk with Google & GitHub SSO

## Overview

Add a new `packages/auth` microfrontend (port 3005) using Clerk's prebuilt components for Google + GitHub SSO. The shell hosts `<ClerkProvider>`, the auth remote exposes sign-in/sign-up pages, user menu, auth guard, and profile page. Auth state propagates to other remotes via the existing `auth:login`/`auth:logout` eventBus events.

---

## Phase 1: Auth Remote Package Scaffold

**Port:** 3005  
**MF Name:** `auth`

### Directory Structure

```
packages/auth/
├── package.json
├── webpack.config.js
├── tsconfig.json
├── postcss.config.mjs
├── tailwind.config.ts
├── vercel.json
├── public/
│   └── index.html
└── src/
    ├── index.ts
    ├── bootstrap.tsx
    ├── styles.css
    ├── remotes.d.ts
    ├── global.d.ts
    ├── SignInPage.tsx
    ├── SignUpPage.tsx
    ├── UserMenu.tsx
    ├── AuthGuard.tsx
    └── ProfilePage.tsx
```

### Exposed Modules

| Module | Description |
|--------|-------------|
| `./SignInPage` | Clerk `<SignIn />` with Google + GitHub OAuth, redirects to `/` on success |
| `./SignUpPage` | Clerk `<SignUp />` with same providers |
| `./UserMenu` | Clerk `<UserButton />`; emits `auth:login`/`auth:logout` via eventBus on session changes |
| `./AuthGuard` | Uses `useAuth()`, redirects unauthenticated users to `/sign-in` (preserves return URL) |
| `./ProfilePage` | Clerk `<UserProfile />` |

### Dependencies

- `@clerk/clerk-react` — Clerk's React SDK (prebuilt components + hooks)
- `react`, `react-dom`, `react-router-dom` — shared singletons
- `@mfe-demo/shared` — eventBus, types (via webpack alias)
- `uiKit` — consumed as MF remote for consistent styling

---

## Phase 2: Shell Integration

### webpack.config.js Changes

- Add `AUTH_URL` env var (default: `http://localhost:3005`)
- Add to `ModuleFederationPlugin.remotes`: `auth: 'auth@${AUTH_URL}/remoteEntry.js'`
- Add `@clerk/clerk-react` to shared singletons (singleton: true, requiredVersion)
- Inject `CLERK_PUBLISHABLE_KEY` via `DefinePlugin` from `process.env`

### App.tsx Changes

- Wrap app with `<ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>`
- Add routes:
  - `/sign-in` → `<SignInPage />`
  - `/sign-up` → `<SignUpPage />`
  - `/profile` → `<ProfilePage />`
- Wrap `/checkout` route with `<AuthGuard>`
- Lazy-load auth remote components via `retryLazy()`

### Header.tsx Changes

- Import `UserMenu` from auth remote (lazy loaded)
- Show `<UserMenu />` when signed in
- Show "Sign In" link when signed out
- Use Clerk's `useAuth()` hook to determine state

### Other Shell Changes

- `remotes.d.ts` — Add `auth/SignInPage`, `auth/SignUpPage`, `auth/UserMenu`, `auth/AuthGuard`, `auth/ProfilePage` module declarations
- `remoteRegistry.ts` — Add `{ name: 'Auth', key: 'auth', url: AUTH_URL }` for health checks
- `package.json` — Add `@clerk/clerk-react` as dependency

---

## Phase 3: Shared Package Updates

### eventContracts.ts

Extend `auth:login` payload to include `email`:

```ts
'auth:login': { userId: string; name: string; email: string };
```

### eventSchemas.ts

Update Zod schema:

```ts
'auth:login': z.object({ userId: z.string(), name: z.string(), email: z.string().email() }),
```

---

## Phase 4: Root Config & Deployment

### Root package.json

```json
"start:auth": "npm run start --workspace=packages/auth"
```

Update `"start"` concurrently command to include `start:auth`.

### Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `CLERK_PUBLISHABLE_KEY` | Shell + Auth (dev & Vercel) | Clerk frontend key |
| `AUTH_URL` | Shell (dev & Vercel) | Auth remote URL for Module Federation |

### Clerk Dashboard Configuration

1. Create a Clerk application
2. Enable **Google** OAuth provider
3. Enable **GitHub** OAuth provider
4. Add allowed redirect URLs:
   - `http://localhost:3000` (shell dev)
   - `http://localhost:3005` (auth standalone dev)
   - Production shell URL
   - Production auth remote URL

### Vercel Deployment

- Deploy `packages/auth` as its own Vercel project (same pattern as other remotes)
- Set `AUTH_URL` env var in the shell Vercel project to point to auth's deployed URL
- Set `CLERK_PUBLISHABLE_KEY` in both shell and auth Vercel projects

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| `ClerkProvider` lives in **shell** | All routes/components have Clerk context without re-mounting the provider |
| `@clerk/clerk-react` is a **shared singleton** | Avoids duplicate Clerk instances across MF boundaries |
| Auth remote's `bootstrap.tsx` wraps its own `ClerkProvider` | Enables standalone development on port 3005 |
| Key via env var (`CLERK_PUBLISHABLE_KEY`) | Never hardcoded; secure in CI/CD |
| No backend/BFFE needed initially | Clerk handles sessions client-side |
| Reuses existing `auth:login`/`auth:logout` events | Payload extended with `email` for richer cross-MFE notifications |
| Prebuilt Clerk components | Faster implementation; consistent UX; automatic security best practices |

---

## Protected Routes

| Route | Auth Required | Behavior When Unauthenticated |
|-------|--------------|-------------------------------|
| `/` | No | Public |
| `/products` | No | Public |
| `/cart` | No | Public |
| `/checkout` | **Yes** | Redirect to `/sign-in?redirect_url=/checkout` |
| `/sign-in` | No | Clerk sign-in page |
| `/sign-up` | No | Clerk sign-up page |
| `/profile` | **Yes** | Redirect to `/sign-in?redirect_url=/profile` |
| `/health-check` | No | Public |

---

## Verification Checklist

- [ ] `npm install` resolves cleanly with new auth workspace package
- [ ] `npm run start:auth` — serves `remoteEntry.js` on port 3005
- [ ] Full `npm run start` — all 6 services start; shell loads auth remote
- [ ] `/sign-in` renders Clerk UI with Google/GitHub buttons
- [ ] OAuth flow → redirects back, Header shows UserMenu, `auth:login` event fires
- [ ] `/checkout` while signed out → redirected to `/sign-in` with return URL
- [ ] `/profile` while signed in → Clerk profile page renders
- [ ] Sign out via UserMenu → `auth:logout` fires, Header updates
- [ ] Health check page shows auth remote status
- [ ] `npm run build --workspace=packages/auth` succeeds

---

## Future Considerations

1. **Clerk Appearance Customization** — Style Clerk components to match the Tailwind design system (pass `appearance` prop matching `tailwind-preset.ts` colors: primary-600, dark mode support)
2. **Post-sign-in redirect** — After `/checkout` redirects to `/sign-in`, user should return to `/checkout` via Clerk's `afterSignInUrl` / `redirectUrl` param
3. **Multi-tab session sync** — Clerk handles it natively; eventBus is window-scoped. If other tabs need auth state, add `BroadcastChannel` listener in a follow-up
4. **Server-side token verification** — If an API gateway/BFFE is introduced later, use Clerk's JWT verification middleware
5. **Role-based access** — Clerk supports organizations and roles; can extend `AuthGuard` with role checks when needed
