# Dependencies, bundle install, and patches

[Back to README](../README.md) · [Getting started](getting-started.md) · [Script reference](scripts.md)

## Why are there several install commands?

React Native projects contain JavaScript/TypeScript and native Android/iOS code. Their build tools come from different ecosystems.

| Layer                                | Manager        | Declaration                                    | What it prepares                                                           |
| ------------------------------------ | -------------- | ---------------------------------------------- | -------------------------------------------------------------------------- |
| JavaScript and React Native packages | pnpm           | `package.json`                                 | React, Query, tooling, and RN package native source in `node_modules`      |
| Ruby tools                           | Bundler        | `Gemfile`                                      | CocoaPods, fastlane, xcodeproj, and their Ruby dependencies                |
| iOS native dependencies              | CocoaPods      | `ios/Podfile`                                  | Native library integration into the iOS project/workspace                  |
| Android builds and dependencies      | Gradle Wrapper | `android/*.gradle`, `android/app/build.gradle` | Android libraries, compilation, resource processing, and APK/AAB artifacts |

For example, pnpm installs the MMKV RN package. Android integrates its native module through Gradle, while iOS needs Pods. Installing the JavaScript package alone does not complete native integration.

## What does bundle install do?

`bundle` is the executable for **Bundler**, the Ruby dependency manager. From the app root, this installs the tools in `Gemfile`, including CocoaPods and fastlane:

```sh
bundle install
```

Bundler reads Gemfile version constraints and uses `Gemfile.lock` when available. Without a lockfile it resolves dependencies and writes the selected versions. This matters because the main tools also have transitive dependencies. See the [official RubyGems/Bundler guide](https://guides.rubygems.org/dependency_management/).

The app remains React Native; Ruby is used for build tooling, not app screens. The Gemfile requires Ruby 3.3+ and specific versions of CocoaPods, xcodeproj, and fastlane. `Gemfile.lock` and `ios/Podfile.lock` were absent in the template snapshot inspected on November 19, 2026 because native iOS setup was not yet validated. After successful setup, commit the generated lockfiles to your project.

## Why is pnpm ios:pods still needed?

```text
pnpm install
  → provides RN packages in node_modules

bundle install
  → provides the project's CocoaPods version

pnpm ios:pods
  → runs cd ios && bundle exec pod install
  → integrates iOS native dependencies

pnpm ios
  → builds and opens the app
```

`bundle exec` runs a tool with the dependencies Bundler selected for this project, preventing a globally installed `pod` or `fastlane` from overriding the project version. See [CocoaPods on Gemfiles](https://guides.cocoapods.org/using/a-gemfile.html).

| Term                        | Meaning here                                             |
| --------------------------- | -------------------------------------------------------- |
| `bundle install`            | Installs Ruby tools/libraries                            |
| JavaScript bundle           | JavaScript processed by Metro for the app                |
| Android App Bundle (`.aab`) | Android distribution artifact from `pnpm android:bundle` |

## When should installation be repeated?

| Event                                                   | Action                                                                                     |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| First clone                                             | `pnpm install --frozen-lockfile`; for iOS follow with `bundle install` and `pnpm ios:pods` |
| Editing TypeScript components or business logic         | None of the three installs needs repeating                                                 |
| Changing JavaScript dependencies                        | Run pnpm to update the installation/lockfile                                               |
| Adding, removing, or upgrading an RN native dependency  | Install with pnpm, run `pnpm ios:pods` for iOS, and rebuild affected platforms             |
| Gemfile/Gemfile.lock changes after pull                 | Run `bundle install`; run Pods if iOS integration also changes                             |
| Podfile/Podfile.lock or native module selection changes | Run `pnpm ios:pods`, then build iOS                                                        |
| Android only through `pnpm android`/Gradle              | Bundler and CocoaPods are unnecessary for that flow                                        |
| Using Android fastlane                                  | Bundler is needed because fastlane is a Ruby tool                                          |

`bundle update` and `pod update` are upgrade operations, not routine substitutes for installation after cloning. CocoaPods uses Podfile.lock to preserve versions during `pod install`. See the [CocoaPods installation guide](https://guides.cocoapods.org/using/using-cocoapods.html).

## Why is there a patches directory?

Some requested libraries retain older configuration or runtime assumptions while the starter uses newer React Native and Android Gradle Plugin versions. `patches/` records **small differences against dependency source** so fixes can be reapplied on installation.

For example, Notifications once compiled but crashed on launch because autolinking used the old React Native host. The fix combines a `react-native.config.js` override with a native callback patch; passing TypeScript alone cannot catch this.

pnpm applies patches through `patchedDependencies` in `pnpm-workspace.yaml`. Normal installation is sufficient; neither `patch-package` nor daily Python execution is needed. See the [pnpm settings reference](https://pnpm.io/settings).

### Patches in this starter

| Package/version                          | Fix                                                                                                                                |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `@nozbe/watermelondb@0.28.0`             | Enable `BuildConfig` generation used by Android code                                                                               |
| `react-native-linear-gradient@2.8.3`     | Add Android namespace                                                                                                              |
| `react-native-biometrics@3.0.1`          | Add Android namespace                                                                                                              |
| `react-native-blurhash@2.1.3`            | Add Android namespace                                                                                                              |
| `react-native-fs@2.20.0`                 | Add Android namespace                                                                                                              |
| `react-native-geolocation-service@5.3.1` | Add Android namespace                                                                                                              |
| `react-native-date-picker@5.0.13`        | Replace obsolete ProGuard configuration with available optimize configuration                                                      |
| `react-native-notifications@5.2.2`       | Fix ProGuard, enable BuildConfig, use modern ReactHost for token callbacks, and defer token retrieval until Firebase is registered |
| `recoil@0.7.7`                           | Use the public external-store hook when the React 19 renderer lacks the legacy dispatcher object.                                  |

A namespace identifies Android library code/resources. BuildConfig is a generated configuration class. ProGuard/R8 concern release optimization. These patches fix library build/runtime requirements, not application business APIs.

### What template users should do

- Keep any generated `patches/`, the matching `patchedDependencies`, and the lockfile with project source.
- Use `pnpm install` as appropriate; patches apply automatically.
- Do not remove a patch solely because debug builds pass; test release and runtime too.
- Do not make a dependency fix only in `node_modules`, where it cannot be reproduced from project source.

The generator keeps patch files and `patchedDependencies` entries for the selected packages. If none need a patch, the generated app has no `patches/` directory or `patchedDependencies` block.

### Maintaining or upgrading the template

`python3 scripts/prepare-native-patches.py` regenerates patches for the packages specified in the script using installed dependency source and a temporary directory. It is not a daily install command or a general patch generator.

1. Inspect the new library changelog/source to see whether the fix has landed upstream.
2. Adjust version, patch, and metadata together; an old-version patch does not prove the new version is compatible.
3. Run `pnpm install` to update the lockfile, then `pnpm verify` and native builds using the library.
4. Test release and previously broken operations. For Notifications, at least test startup and the notification flows used by the product.
5. Remove a patch only once unnecessary; keep the patch generator, `patchedDependencies`, and lockfile consistent.

## Files to keep in Git

| Keep                                                                | Reason                                             |
| ------------------------------------------------------------------- | -------------------------------------------------- |
| `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `patches/` | Reproduce JavaScript dependencies and native fixes |
| `Gemfile`, `Gemfile.lock` once available                            | Reproduce Ruby tools                               |
| `ios/Podfile`, `ios/Podfile.lock` once available                    | Define and lock Pods                               |
| Native source, Gradle Wrapper, public app configuration             | Source used to build the app                       |

This template flow does not commit `node_modules`, Pods, build caches, or test artifacts. Service and signing credentials are managed per app under the generator exclusion rules and `.gitignore`.

`pnpm-workspace.yaml` is used even for a single app: it also configures hoisted dependency layout, dependency build-script permissions, and the patch map. It does not require a monorepo.
