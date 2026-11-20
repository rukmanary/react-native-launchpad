# Agent guide for React Native Starter Pack

These instructions apply to this repository. Inspect the current source before editing. Past validation records apply to the builds and configurations tested at the time.

## Project goals

This is a bare React Native starter with pnpm, TypeScript, feature-based architecture, and a generator for new apps. Keep the architecture modular, functional, testable, scalable, and easy to maintain. Add abstractions for concrete needs.

The template keeps the full library and adapter catalog. Only `core` is active for autolinking by default. The generator creates a separate app folder and removes the dependencies and source of omitted modules. Keep the default product app focused on the modules it needs.

## Working rules and access

- Write project documentation and script messages in English. Use Indonesian when discussing work with the user in Indonesian.
- **Never read environment files, including examples.** This applies to `.env`, its variants, `.xcode.env`, and environment examples. Exclude them from content searches, file dumps, and tool output.
- Avoid requesting or displaying secrets, credentials, personal tokens, and signing file contents. Check only for existence when sufficient. Public app settings live in `starter.config.json`.
- Preserve edits from the user and other agents. Assign clear file ownership when collaborating.
- Commit, push, publish, or send external messages only with authorization. Keep AI attribution, co-author metadata, and personal data out of Git metadata.
- Follow sandbox and tool approval rules. If automatic approval fails, explain why and respect the access boundary.
- Keep project documentation in the repository's README and docs. Write to mydocs or an external document only when the user asks.
- Report what was verified by compilation, smoke tests, device QA, or service integration. Qualify production readiness accordingly.

## Read first

| File                                                       | Purpose                                                                |
| ---------------------------------------------------------- | ---------------------------------------------------------------------- |
| `README.md`                                                | Setup and documentation index                                          |
| `package.json`, `pnpm-lock.yaml`                           | Commands and selected JavaScript dependency versions                   |
| `starter.config.json`, `config/dependencies.json`          | App identity, public services, selected modules, and dependency groups |
| `docs/architecture.md`, `docs/modules.md`                  | Design boundaries and adapter APIs                                     |
| `docs/compatibility.md`, `pnpm-workspace.yaml`, `patches/` | Version exceptions and native patches                                  |
| `docs/validation.md`                                       | Test results and their limits                                          |
| `docs/scripts.md`, `docs/dependencies-and-patches.md`      | Script behavior, Bundler, Pods, and patch maintenance                  |

Use the owning files for version information. The recorded configuration uses React Native 0.88.1, React 19.3.1, pnpm 12.15.0, TypeScript 6.0.3, and JDK 17. The Gemfile requires Ruby 3.3+. Check peer ranges, native compatibility, and patches before upgrading.

## Code layout and state ownership

- `src/app` wires providers, navigation, stores, lifecycle, and app workflows.
- `src/features` owns product screens, API calls, queries, schemas, and domain components. Export each feature's public API through `index.ts`.
- `src/core` holds HTTP, session and Keychain, MMKV preferences, permissions, and configuration.
- `src/shared` holds UI, theming, and helpers independent of the product domain.
- `src/modules` provides optional capability adapters. Keep product rules in features.
- `src/generated` is written by the module configurator. Change its inputs for durable edits.
- `tests` holds unit, component, and generator tests. Update `jest.config.js` to discover colocated tests.

TanStack Query or Apollo Client owns server cache, React Hook Form owns form state, and the selected state manager owns shared client state, and component state owns temporary UI. Keychain stores credentials and MMKV stores non-sensitive preferences. Use WatermelonDB for datasets intentionally designed for offline use. Keep server data with one owner.

Use the fetch wrapper in core. Preserve abort and timeout handling, single-flight refresh, schema validation, session generations, and serialized Keychain operations. General mutation retries can duplicate server operations.

The app root provides safe area, gesture, and keyboard contexts. Assign inset and keyboard handling to the appropriate screen, header, tabs, modal, or sheet. Camera, video, and location use screen focus and `AppState`. Clean up subscriptions, players, and requests.

## Commands and verification

```sh
pnpm verify
pnpm format:check
```

`verify` runs TypeScript, ESLint, Jest and React Native Testing Library, and script tests. Run formatting, native builds, Maestro, and size or alignment checks separately when relevant.

For documentation changes, check the formatting, relative links, and whether examples match the scripts:

```sh
pnpm exec prettier --check README.md AGENTS.md docs
```

- `pnpm run doctor` runs starter prerequisites checks. `pnpm doctor` calls pnpm's built-in command.
- `pnpm install --frozen-lockfile` installs from the lockfile and applies configured pnpm patches.
- `bundle install` installs Ruby tools. `pnpm ios:pods` runs CocoaPods through Bundler. Android CLI and Gradle builds use Ruby only when run through workflows such as fastlane.
- `pnpm e2e` requires an installed app and an available device. The smoke flow clears data for the selected app, so use a test installation.
- `pnpm native:alignment path/app.apk` checks 64-bit ELF alignment. Test runtime behavior on a 16 KB device and check ZIP alignment separately.
- `pnpm size:check path/app.apk` compares artifacts with consistent profile, ABI, signing, and filename. Use `--record` when intentionally replacing the baseline.

Release builds are unsigned by default. `-PtestSigning` uses the debug key for APK testing. Validate production signing separately. Rebuild the affected platform and run tests proportional to the change.

## Generator and script behavior

- Production uses the base native IDs. Dev and QA append suffixes and have separate service settings. See `docs/flavors.md` for schemes, service registrations, and build commands.
- `pnpm create-app --help`, `pnpm list:modules`, and `pnpm list:states` show capability and state choices. `pnpm list:apis` shows API technologies. `--modules all` includes every capability. `--state` and `--api` select the corresponding providers.
- `pnpm create-app` defaults to a sibling folder named after the app slug. `--target` selects another new folder outside the template. `--git` initializes an empty local repository in the target.
- Generated apps start with a blank README and keep app tooling, `docs/app-scripts.md`, the selected module configuration and patches, and source license notices. The Firebase registration guide is included with that module. Maintainer docs, CI, and generator maintenance tools stay in this repository.
- After `--skip-install`, run `pnpm install --no-frozen-lockfile` once in the target to create its lockfile. Use frozen installs afterward.
- `pnpm modules` **replaces the active list**. Include every module that should stay active. Install dependencies and restore any previously pruned source before configuring the list, then run Pods or rebuild as needed.
- The generator's `--state zustand` selects the Zustand preset. Switch existing apps between state managers through a separate migration.
- The configurator rewrites `src/generated`, `OptionalPackages.kt`, and `starter:*` manifest and plist blocks. Edit their inputs or owning script for changes that must persist.
- `dependencies:audit` compares versions as text against a local snapshot. Use separate tools for live registry checks and security audits.
- `scripts/sync-dependencies.mjs` is an internal bootstrap script that overwrites parts of the package manifest. Review its effects on names, engines, scripts, and compatibility exceptions before using it.

## Patches and native compatibility

Version-specific patches fix legacy namespaces, BuildConfig, ProGuard, Notifications, and Recoil on React 19. pnpm applies them through `patchedDependencies` in `pnpm-workspace.yaml`. Generated projects keep patch entries and files for their selected dependencies.

`scripts/prepare-native-patches.py` reads installed packages, reconstructs patch inputs in a temporary directory, and writes patches and metadata. Store durable fixes in patches and review patch definitions and lockfile together when upgrading.

Notifications needs the `RNNotificationsPackage(getApplication())` autolinking override in `react-native.config.js`. The CLI qualifies the class name. The token patch uses `ReactHost` and defers FCM until Firebase is configured. The Android remote registration adapter requires an enabled Firebase configuration.

Review `docs/compatibility.md` before changing the Skia and Victory pairing, Babel major version, or TypeScript parser compatibility. Rozenite loads in development, network recording is opt-in, and its storage inspector excludes Keychain.

## Historical validation

The original ARM64 core and full catalog excluding Firebase passed debug and release builds. Their release smoke tests passed after the Notifications startup fix. The core and catalog APKs passed ELF alignment for 23 and 33 native libraries respectively, and ZIP alignment passed. The emulator used 4 KB pages. The debug-signed core and catalog APKs were about 28.38 MiB and 58.90 MiB. Current flavor checks and earlier results are detailed in `docs/validation.md`.

iOS builds, native cloud integrations, production signing, fastlane archive and distribution, remote CI, and the full device matrix remain to be validated. Use real app registrations to verify integrations. The sample API uses `example.invalid`, and the demo form validates input locally. Adapt backend contracts to the app.

Local logs and build artifacts may be available under `artifacts/` and build output directories. Recheck availability before referring to older temporary paths.

## Documentation handoff

- `README.md` links to the setup and workflow guides.
- `docs/getting-started.md` covers tools, generation, installation, and running the app.
- `docs/scripts.md` covers package scripts, helpers, maintainer tools, inputs, outputs, side effects, and CI.
- `docs/dependencies-and-patches.md` explains package managers, lockfiles, and the dependency patches.
- `docs/workflow.md` covers everyday development, state and layout ownership, public settings, restoring pruned modules, and troubleshooting.
- `docs/flavors.md` describes IDs, Xcode schemes, platform commands, and service registrations.

For unresolved native validation, follow `docs/validation.md` and the user's next request.
