# Application scripts

Run these commands from the app root, where `package.json` lives. Use `pnpm run` to list the scripts available in this checkout.

Local app and Jest imports use `@/`, for example `@/shared/ui`. TypeScript, Metro, and Jest read the aliases defined in [tsconfig.json](../tsconfig.json). Node scripts use `#project/` through the import map in [package.json](../package.json).

## Install and run

If you generated the app with `--skip-install`, run `pnpm install --no-frozen-lockfile` to install dependencies and create `pnpm-lock.yaml`. On a checkout with a lockfile, run `pnpm install --frozen-lockfile`. pnpm applies any patches registered in `pnpm-workspace.yaml` during installation.

| Command           | When to use it                                                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run doctor` | Check local tools and prerequisites after installing dependencies. Read any `SETUP` messages.                                                         |
| `pnpm start`      | Start Metro. Keep it running in a separate terminal for debug builds.                                                                                 |
| `pnpm android`    | Build, install, and open the Android debug app on an emulator or device. Requires a JDK and the Android SDK.                                          |
| `pnpm ios`        | Build and open the iOS app on macOS after installing Pods. Requires Xcode and a simulator or configured device.                                       |
| `bundle install`  | Install the Ruby gems declared in [Gemfile](../Gemfile), including CocoaPods and fastlane. Run this before using either tool.                         |
| `pnpm ios:pods`   | Run CocoaPods through Bundler. Run after the first dependency install or when native dependencies change. Open the generated `.xcworkspace` in Xcode. |

`pnpm android` and `pnpm ios` default to `dev`. Add `qa` or `production` to select another flavor, for example `pnpm android qa`. Production uses the base app ID from [starter.config.json](../starter.config.json), while dev and QA append `.dev` and `.qa`. The same config stores public service values for each flavor.

The app opens on Home. The Component, API, and Profile placeholders mount on their first visit. Home links to the starter examples.

## Check and format code

| Command             | What it does                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| `pnpm typecheck`    | Runs TypeScript diagnostics without emitting JavaScript.                                         |
| `pnpm lint`         | Runs ESLint on app entry files, `src`, `scripts`, and `tests`, including import-boundary checks. |
| `pnpm test`         | Runs Jest and React Native Testing Library tests.                                                |
| `pnpm verify`       | Runs typecheck, lint, and tests in order. Stops on the first failure.                            |
| `pnpm format:check` | Checks Prettier formatting, including this guide.                                                |
| `pnpm format`       | Rewrites files in the Prettier scope to match project formatting.                                |

## Update native metadata

`pnpm modules <comma-separated-list>` replaces the entire active module list. Pass every module you want to keep. `pnpm modules all` selects all groups in [config/dependencies.json](../config/dependencies.json), and running without arguments selects `core`.

Run the command after changes to settings that affect native metadata, such as the iOS display name or URL schemes. It regenerates module exports and startup hooks, Android manifest entries, iOS plist entries, and flavor settings. Adding a capability absent from the project also requires its source, dependencies, native integration, and any matching patches. Install Pods on iOS and rebuild after native changes.

## Build release artifacts

These commands default to `production` and accept `dev` or `qa` as the first argument.

| Command                                        | Output                                                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `pnpm android:release qa`                      | One APK for the configured ABIs in `android/app/build/outputs/apk/qa/release/`.                         |
| `pnpm android:apk qa`                          | Separate APKs per ABI in the same folder. An ABI is a target CPU architecture.                          |
| `pnpm android:apk:arm64 qa`                    | An APK that targets ARM64 only, in the same folder.                                                     |
| `pnpm android:bundle production`               | An AAB in `android/app/build/outputs/bundle/productionRelease/`.                                        |
| `bundle exec fastlane android build flavor:qa` | Builds a QA AAB with the lane in [Fastfile](../fastlane/Fastfile).                                      |
| `bundle exec fastlane ios build flavor:qa`     | Archives the QA scheme using the workspace and signing settings. Requires Pods and Xcode signing setup. |

The Android release scripts create unsigned artifacts by default. Configure production signing before distributing a release.

## Brand, optimize, and inspect artifacts

| Command                                            | What it does                                                                                                                                                                                                            |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm brand src/assets/logo.svg`                   | Generates launcher icons and BootSplash assets for both platforms. Replaces the existing assets at their generated paths. Rebuild to see the changes.                                                                   |
| `pnpm assets:optimize ./photos ./optimized-photos` | Converts PNG/JPEG/WebP files in the input folder to WebP in a separate output folder. Updates to app imports are manual.                                                                                                |
| `pnpm size:check path/to/app.apk`                  | Reports the artifact size and compares it with the same filename in [the size budget](../config/size-budget.json). Add `--record` only to create or replace the baseline for the same flavor, ABI, and signing profile. |
| `pnpm native:alignment path/to/app.apk`            | Uses `unzip` to check 16 KB ELF alignment for 64-bit native libraries. ZIP alignment and runtime behavior on a 16 KB device are separate checks.                                                                        |

## Run device tests

```sh
pnpm setup:maestro
pnpm e2e qa android
```

`pnpm setup:maestro` downloads the version in [config/toolchain.json](../config/toolchain.json) into `.tools/maestro`. It needs network access, `unzip`, and Java. Run it once per checkout or after changing the pinned version.

`pnpm e2e [flavor] [platform]` runs the [Maestro flows](../.maestro/) against an already installed app. The defaults are `dev` and `android`. Connect an emulator, simulator, or device first, and keep Metro running for debug apps. **The included smoke flow clears the selected app's local data.** Run it against a test installation.
