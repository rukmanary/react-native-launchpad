# Script reference

[Back to README](../README.md) · [Getting started](getting-started.md) · [Workflow](workflow.md)

Run commands from the application/template root containing `package.json`. Choose the commands relevant to your task; do not run the entire page sequentially. `pnpm <script>` generally abbreviates `pnpm run <script>`, but use `pnpm run doctor` because pnpm has its own `doctor` command.

Generated projects include the [application scripts guide](app-scripts.md) for the commands they can run locally. Projects with the Firebase module also include the [Firebase registration guide](app-firebase.md).

## Daily development

| Command           | Purpose and effect                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| `pnpm start`      | Starts Metro and remains active in the terminal; it does not make a release APK.                 |
| `pnpm android`    | Builds, installs, and opens a debug app using the RN CLI; needs JDK, SDK, and a device/emulator. |
| `pnpm ios`        | Builds and opens iOS on macOS; prepare Xcode and Pods first.                                     |
| `pnpm run doctor` | Reports available tools and some service prerequisites without installing or fixing them.        |

Keep Metro running while using a development build that fetches JavaScript from it; release builds carry their own bundle. [doctor.mjs](../scripts/doctor.mjs) also checks Xcode/CocoaPods on macOS, but does not fully validate tool versions, SDKs, device connectivity, or native functionality. Review details even for `PASS`.

## Code checks and formatting

| Command             | Action and side effects                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| `pnpm typecheck`    | TypeScript check without JavaScript output (`tsc --noEmit`); does not change source.                       |
| `pnpm lint`         | Checks app entry files, `src`, `scripts`, and `tests` with ESLint, including architecture boundaries.      |
| `pnpm format`       | Writes Prettier formatting to source, scripts, tests, config, docs, CI, Maestro, and root project configs. |
| `pnpm format:check` | Checks formatting over the same files covered by `pnpm format`.                                            |
| `pnpm test`         | Runs Jest/RNTL TypeScript tests in `tests`; tooling may create cache.                                      |
| `pnpm test:scripts` | In the template, runs Node generator tests in `tests/scripts/*.test.mjs` using temporary fixtures.         |
| `pnpm verify`       | Runs typecheck → lint → test, then `test:scripts` in the template. Stops at the first failure.             |

Before committing, run `pnpm verify` and `pnpm format:check`. Verify excludes formatting, native builds, Maestro, APK size, and device tests. Check docs separately with `pnpm exec prettier --check README.md docs`.

## Create a project and select modules

### pnpm create-app

Use `pnpm create-app --help` or `pnpm create-app -h` for arguments. `pnpm list:modules` lists capabilities, `pnpm list:states` lists state managers, and `pnpm list:apis` lists API technologies. The matching generator flags are `--list-modules`, `--list-states`, and `--list-apis`. `--modules all` selects the full capability catalog. `--dry-run` reports the selected presets plus flavor IDs and schemes.

Run [create-app.mjs](../scripts/create-app.mjs) from the template to create a new folder, not to change an existing app in place:

```sh
pnpm create-app --name ShopApp --android-id com.example.shop \
  --modules core,ui,media --git --dry-run
```

| Argument                                  | Meaning and constraints                                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `--name ShopApp`                          | Required internal/native name; starts with an uppercase letter and contains only letters/numbers. |
| `--target ../shop-app`                    | Optional path to a new folder outside the template. Defaults to a sibling named after the slug.   |
| `--android-id com.example.shop`           | Required Android application ID, at least three lowercase segments as validated by the script.    |
| `--ios-id com.example.shop`               | iOS bundle ID; defaults to Android ID; underscores rejected.                                      |
| `--slug shop-app`                         | npm package name and URL scheme; defaults from name, lowercase with hyphens.                      |
| `--display-name "Shop App"`               | User-visible name; defaults to `--name`; certain XML characters are rejected.                     |
| `--modules core,ui,media`                 | Included capabilities. Defaults to core. Use `all` for the full catalog.                          |
| `--state redux, zustand, mobx, or recoil` | Selects the shared state provider. Defaults to Redux Toolkit.                                     |
| `--api rest or graphql`                   | Selects the API provider and catalog integration. Defaults to REST.                               |
| `--dry-run`                               | Prints the plan without creating a folder, installing, or initializing Git.                       |
| `--skip-install`                          | Defers installation and lockfile creation. Run `pnpm install --no-frozen-lockfile` afterward.     |
| `--git`                                   | Initializes empty local Git; does not create a commit, remote, or push.                           |

The target parent must already exist. Explicit relative targets are resolved from the working directory. `--slug` sets the package name and the default folder name. The generator changes identity, prunes modules, resets services and size baseline, and excludes recognized Git history, caches, and credentials. It installs by default. If install fails after folder creation, repair it there. See [getting started](getting-started.md).

Generator commands, dependency audit tools, and the template CI workflows stay in the starter. See [generated project contents](getting-started.md#what-the-generated-app-contains) for the files and module configuration included in an app.

All three flavors are available. Android and iOS IDs define production IDs; dev and QA add suffixes. See [flavors](flavors.md).

### pnpm modules

[configure-modules.mjs](../scripts/configure-modules.mjs) changes the **entire active selection** in the current project:

```sh
pnpm modules core,ui,media
```

List every capability to retain. Running without arguments returns to core. The command updates the modules section in `starter.config.json`, `src/generated/bootstrap.ts`, `src/generated/modules.ts`, generated AndroidManifest/Info.plist permission, URL-scheme and service metadata blocks, and `OptionalPackages.kt`. It checks manifest packages but **does not install dependencies, restore pruned source, run Pods, or rebuild**. See [adding modules](workflow.md#selecting-and-adding-modules).

`pnpm modules all` prepares the full catalog in the complete template; Firebase and other services still need configuration. Select state and API presets with the generator. [State and API presets](state-and-api.md).

## iOS and Ruby tools

| Command             | Prerequisites and effect                                                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bundle install`    | With Ruby matching Gemfile and Bundler available, installs gems and creates/uses `Gemfile.lock`; does not install app Pods.                                 |
| `pnpm ios:pods`     | After pnpm and bundle installs with Xcode available, runs `cd ios && bundle exec pod install`, preparing Pods, workspace, lockfile, and native integration. |
| `pnpm ios:services` | With Bundler and Firebase module/registration files ready, checks iOS registration per flavor; optional example: `pnpm ios:services qa`.                    |

[setup-ios-services.rb](../scripts/setup-ios-services.rb) checks registrations; an Xcode build phase selects the flavor's plist. See [Firebase file locations](flavors.md#firebase-google-and-maps) and [dependencies and patches](dependencies-and-patches.md).

## Android builds and fastlane

Android build commands accept `production`, `dev`, or `qa`; release defaults to production and `pnpm android`/`pnpm ios` to dev. See [flavors](flavors.md). An ABI is a target CPU architecture. Defaults are ARM64 (`arm64-v8a`) and x86_64; including more ABIs adds native binaries.

| Command                              | Output/use                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `pnpm android:release`               | One release APK for configured ABIs in `android/app/build/outputs/apk/<flavor>/release/`.               |
| `pnpm android:apk`                   | Separate release APKs per ABI, named accordingly.                                                       |
| `pnpm android:apk:arm64`             | ARM64-only release APK.                                                                                 |
| `pnpm android:bundle`                | AAB in `android/app/build/outputs/bundle/<flavor>Release/`.                                             |
| `bundle exec fastlane android build` | Runs Gradle bundle Release via fastlane; does not upload to Play.                                       |
| `bundle exec fastlane ios build`     | Runs `build_app` for the app workspace/scheme after toolchain and signing setup; not locally validated. |

Run lanes in [Fastfile](../fastlane/Fastfile) from the project root. Fastlane is unnecessary for the direct Android commands. Release uses Hermes, R8, and resource shrinking; production signing is not configured. The default unsigned universal/ARM64 APK is normally `app-production-release-unsigned.apk`; check Gradle output for the actual name. An unsigned APK cannot be installed like a debug APK. AAB also requires appropriate signing for distribution. Builds do not automatically run unit tests or Maestro.

For explicit debug signing of a release test artifact:

```sh
# From the root; this artifact is only for testing
cd android
./gradlew assembleProductionRelease -PreactNativeArchitectures=arm64-v8a -PtestSigning
cd ..
```

The signed test artifact is normally `app-production-release.apk`. Production signing is separate.

## Branding, assets, and size

### pnpm brand

```sh
pnpm brand src/assets/logo.svg
```

[brand.mjs](../scripts/brand.mjs) accepts one SVG/PNG/JPG/JPEG and writes Android launcher icons, iOS icons, and BootSplash assets. Existing same-named icon/splash files can be overwritten. App name and package IDs do not change. Background color and logo size are currently set in the script, without CLI flags for all design choices. Rebuild/reinstall to see native resources. The script preserves generated manifest/plist block markers.

### pnpm assets:optimize

```sh
pnpm assets:optimize src/assets/photos artifacts/optimized-photos
```

[optimize-assets.mjs](../scripts/optimize-assets.mjs) reads PNG/JPG/WebP files directly in the input folder and writes WebP to a separate output, at most 1920×1920 and quality 82 without enlarging small images. It does not recurse, compress video/SVG, update imports, or automatically reduce APK size. Outputs use the basename, so `photo.jpg` and `photo.png` both become `photo.webp` and the later output may overwrite the earlier one.

### pnpm size:check

```sh
# First time after approving this profile's size
pnpm size:check android/app/build/outputs/apk/production/release/app-production-release-unsigned.apk --record

# Subsequent build: compare without replacing the baseline
pnpm size:check android/app/build/outputs/apk/production/release/app-production-release-unsigned.apk
```

[check-size.mjs](../scripts/check-size.mjs) reports size and difference from `config/size-budget.json`. `--record` overwrites the baseline; otherwise growth above `maxGrowthPercent` fails the command. With no baseline it only reports a note. Baselines are keyed by **filename**, not module/ABI/signing profile; compare consistent profiles and remember signed and unsigned names differ. Do not record every build. AAB size is not Play device download size.

### pnpm native:alignment

```sh
pnpm native:alignment android/app/build/outputs/apk/production/release/app-production-release-unsigned.apk
```

[check-native-alignment.mjs](../scripts/check-native-alignment.mjs) requires `unzip` and checks minimum 16 KB ELF alignment of ARM64/x86_64 `.so` libraries in the APK without changing it. It does not check ZIP alignment or run on a 16 KB device; both require separate checks.

## Device testing with Maestro

```sh
pnpm setup:maestro
pnpm e2e qa android
```

[setup-maestro.mjs](../scripts/setup-maestro.mjs) downloads the CLI version in `config/toolchain.json` to `.tools/maestro`; it needs network access, `unzip`, and suitable Java. Normally run once per machine/project or CLI version change.

[e2e.mjs](../scripts/e2e.mjs) uses the local CLI, falling back to global `maestro`, and runs `.maestro/` flows. **The app must already be built and installed and an emulator/device available**. Debug builds also need Metro; release does not. The smoke flow clears target app data, opens home, and fills a form; use a test app/device. It does not cover every native module or backend. Syntax: `pnpm e2e [flavor] [platform] [Maestro options]`; default is dev Android.

## Dependency inspection and template maintenance

### pnpm dependencies:audit

[audit-dependencies.mjs](../scripts/audit-dependencies.mjs) compares versions in `package.json` with the **local snapshot** `config/dependency-audit.json` and reports differences. It does not access the registry, install, scan vulnerabilities, or upgrade. Comparison is textual: `^2.15.5` may differ from `2.15.5` even when the installed version is the same.

### scripts/sync-dependencies.mjs — internal bootstrap

This script has no package.json alias and **is not a routine dependency updater**. It fetches npm `/latest` metadata and rewrites `package.json` and the audit snapshot. It also resets package name, engines, and scripts from its bootstrap definition, potentially removing additional commands or compatibility exceptions. Maintainers should inspect and adapt the source before considering `node scripts/sync-dependencies.mjs`. It does not fully update the lockfile, patches, Gradle, or Ruby tooling and does not establish compatibility. Use targeted upgrades and the [patch guide](dependencies-and-patches.md).

### scripts/prepare-native-patches.py — maintainer tool

```sh
# Only when maintaining patches, not during everyday app setup
python3 scripts/prepare-native-patches.py
```

Reads specified installed packages, generates version-specific patches, and updates `patchedDependencies`. Requires the dependencies, Python 3, and Git. Work happens in a temporary directory rather than editing the package store. Reconcile the lockfile with pnpm and test build/runtime after changes. See [dependencies and patches](dependencies-and-patches.md) for each patch.

### Helpers not run directly

| File                                  | User and responsibility                                                                                    |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `scripts/lib/files.mjs`               | Generator copy helper: excludes recognized cache/credentials, rejects symlinks, and transforms text/paths. |
| `scripts/lib/eslint-architecture.mjs` | ESLint helper reporting invalid cross-boundary imports; not a feature generator.                           |

## Provided GitHub automation

| Workflow                               | Trigger                  | Coverage                                                                             |
| -------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------ |
| `.github/workflows/quality.yml`        | Push/pull request        | JS checks, generator smoke, Android build, APK alignment, AAB, artifact upload.      |
| `.github/workflows/native-modules.yml` | Manual workflow_dispatch | Generate catalog excluding Firebase, typecheck, Android build, alignment, artifacts. |
| `.github/workflows/ios.yml`            | Manual workflow_dispatch | Set up Ruby/Pods and build iOS simulator without signing.                            |

These are GitHub Actions workflows, not terminal scripts to run one by one. Current CI does not automatically run Maestro or publish to stores. [Validation](validation.md) distinguishes local and remote results.
