# Architecture

[Back to README](../README.md) · [Development workflow](workflow.md) · [Module guide](modules.md)

Dependencies flow from `app` to `features` to `core` and `shared`. The app wires providers, navigation, lifecycle, and workflows. Features own screens, domain components, API calls, queries, schemas, business rules, and tests. Core houses technical adapters, while shared code is independent of the product domain. Optional capabilities live in `src/modules` and stay independent of app and feature code. Module configuration scripts write `src/generated`.

Use `@/` for local app and Jest imports. `@/shared/ui` resolves to `src/shared/ui`, and `@/config/flavors.json` resolves to `config/flavors.json`. TypeScript, Metro, and Jest use the mappings from `tsconfig.json`. Node tooling uses `#project/` through the package import map.

Import a feature through its `index.ts`, for example `@/features/catalog`. Inside a feature, use its own aliased paths for implementation files. The template keeps core tests under `tests` so they still run after the generator prunes optional modules. To colocate product tests with implementation, update `testMatch`.

TanStack Query or Apollo Client owns server data and caching, depending on the selected API preset. React Hook Form owns form values. The selected state manager owns shared client state, and component state owns temporary UI. Keychain holds credentials, while MMKV stores non-sensitive preferences. An offline database becomes the local source of truth for datasets explicitly designed to work offline. Keep each kind of data with its owner.

The HTTP client limits request origins, forwards timeouts and cancellation, and validates payloads with Zod. Concurrent refreshes share one request, and a session change invalidates stale results. Adapt the example `{accessToken, refreshToken}` contract, paths, and schemas to your backend. Queries may retry transient errors. Mutations skip automatic retries, and token refresh follows its own rules.

Keep rendering pure. Use effects for external synchronization and clean them up. Camera, video, and location integrate screen focus and `AppState` because a mounted screen can be inactive. Dispose of imperative media players when finished. Add memoization where profiling shows it helps.

The root provides gesture, safe area, and keyboard contexts. Apply each inset at its owner, including navigation headers and bottom tabs. `FormScreen` scrolls inputs into view, `AppModal` provides a native surface context, and `Sheet` uses Bottom Sheet's keyboard handling. Place keyboard avoidance at a single layer.

Rozenite loads in development builds. Enable network recording through Controls with a test account. The storage inspector excludes Keychain, and Redux stores no session credentials.

Keep folder structure proportional to the feature. Share one definition for facts that must stay consistent, use small functions and contracts, prefer composition, make transforms immutable, and validate at boundaries. Profile the release build before optimizing.
