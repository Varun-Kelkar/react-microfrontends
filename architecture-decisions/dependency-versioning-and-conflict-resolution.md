# Dependency Versioning & Conflict Resolution

## Problem

In Module Federation, shared dependencies (especially singletons like React) must be version-compatible across all participants. The shell application loads first and registers its version of shared libraries. Remotes then either reuse that version or face a conflict. This raises the question: **can remotes use newer versions than the shell?**

## How Module Federation Version Negotiation Works

1. Shell loads and registers its shared modules (e.g., `react@18.3.1`)
2. Each remote declares its own `requiredVersion` in its webpack config
3. Module Federation compares versions at runtime:
   - If `strictVersion: true` — a mismatch **throws a runtime error**
   - If `strictVersion: false` (default) — MF picks the **highest compatible version** from all participants

### Key Config Options

| Option | Effect |
|--------|--------|
| `singleton: true` | Only one instance loaded (required for React — multiple instances break hooks/context) |
| `strictVersion: true` | Hard failure if loaded version doesn't satisfy `requiredVersion` |
| `requiredVersion` | Semver range the participant declares it needs |
| `eager: true` | Bypasses negotiation — the eager module's version is always used (avoid on remotes) |

## Our Current Configuration

All MFEs use:

```js
shared: {
  react: { singleton: true, strictVersion: true, requiredVersion: '^18.3.1' },
  'react-dom': { singleton: true, strictVersion: true, requiredVersion: '^18.3.1' },
  'react-router-dom': { singleton: true, strictVersion: true, requiredVersion: '^6.23.1' },
}
```

This is **safe but rigid** — any version outside the exact range crashes at runtime.

## Strategies for Flexible Versioning

### 1. Relax `strictVersion` and Broaden Ranges

Remove `strictVersion: true` and use broader semver ranges:

```js
react: { singleton: true, requiredVersion: '^18.0.0' },
'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
'react-router-dom': { singleton: true, requiredVersion: '^6.0.0' },
```

With this approach, MF picks the **highest version any participant provides** that satisfies all ranges. If cart ships `18.4.0` and shell has `18.3.1`, MF picks `18.4.0`. No crash, no compromise.

### 2. Centralize Shared Config (Recommended for Monorepo)

Create a single source of truth that all webpack configs import:

```js
// packages/shared/src/federation-shared.js
module.exports = {
  react: { singleton: true, requiredVersion: '^18.0.0' },
  'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
  'react-router-dom': { singleton: true, requiredVersion: '^6.0.0' },
};
```

Each MFE's webpack config:

```js
const federationShared = require('@mfe-demo/shared/federation-shared');

new ModuleFederationPlugin({
  // ...
  shared: federationShared,
});
```

One file to update → all MFEs stay in sync.

### 3. Root-Level Dependency Overrides

Use the root `package.json` to enforce consistent installs across the monorepo:

```json
{
  "overrides": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1"
  }
}
```

This ensures `npm install` resolves the same version everywhere, preventing accidental drift between packages.

### 4. Handling Major Version Transitions (e.g., React 18 → 19)

Major version jumps cannot be negotiated — React 18 and 19 can't coexist in the same tree. Options:

- **Phased migration**: Shell upgrades first. Remotes update on their own schedule. During the transition, remotes still on the old version temporarily remove the library from `shared` and bundle their own copy (accept duplication cost).
- **Feature flags**: Gate the upgrade behind a flag so teams can test independently before going live.
- **Adapter/isolation pattern**: For extreme cases, wrap incompatible remotes in iframes or shadow DOM to isolate React instances entirely.

### 5. Non-Singleton Libraries

For libraries that **don't need** to be singletons (e.g., utility libraries like lodash, date-fns):

- Simply remove them from the `shared` config and let each MFE bundle its own copy
- Or share them **without** `singleton: true` — MF will load multiple versions side-by-side if needed

## Decision

| Library | Strategy |
|---------|----------|
| `react`, `react-dom` | Singleton, broad range (`^18.0.0`), centralized config |
| `react-router-dom` | Singleton, broad range (`^6.0.0`), centralized config |
| `@clerk/clerk-react` | Singleton (shares context), match shell's version |
| Utility libs (lodash, etc.) | Don't share — let each MFE bundle independently |

## Constraints

- **React must always be a singleton.** Two React instances sharing a DOM tree will break hooks, context, and event handling. This is a React constraint, not a Module Federation one.
- **The shell's version is the floor, not the ceiling** (when `strictVersion` is off). Remotes can ship higher patch/minor versions and MF will prefer the highest.
- **Major version upgrades require coordination.** There is no way around this for singleton libraries.

## Action Items

1. Drop `strictVersion: true` from all webpack configs
2. Broaden `requiredVersion` ranges to `^18.0.0` / `^6.0.0`
3. Extract shared config to `packages/shared/src/federation-shared.js`
4. Add `overrides` to root `package.json` for install-time consistency
5. Add CI check that validates all MFEs declare compatible version ranges
