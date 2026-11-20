# Getting started

[Back to README](../README.md) · [All scripts](scripts.md) · [Dependencies and patches](dependencies-and-patches.md)

This guide helps you create an app, understand what is installed, and open it in an emulator. Run commands from the project root containing `package.json` unless instructed to `cd` elsewhere.

## 1. Choose your goal

| Goal                          | Where to work                                                |
| ----------------------------- | ------------------------------------------------------------ |
| Learn or improve the starter  | This `starter-pack` repository                               |
| Create a product              | The folder produced by `pnpm create-app`                     |
| Continue a teammate's product | Clone the product repository; do not run the generator again |

Do not change only `androidId` or `iosId` in JSON to create a product. Identity is also stored in Kotlin packages, the Xcode project, manifests, and other files; the generator changes them together.

## 2. Prepare the toolchain

| Tool                         | Purpose                                        | Project reference                                                      |
| ---------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------- |
| Node.js                      | pnpm, Metro, scripts, and JavaScript tooling   | `engines` in `package.json`; tested version in `config/toolchain.json` |
| pnpm                         | Install packages and run scripts               | `packageManager` in `package.json`                                     |
| JDK 17                       | Android builds through Gradle                  | `config/toolchain.json`                                                |
| Android SDK/NDK and emulator | Compile native Android and run the app         | `android/build.gradle`; ABIs in `android/gradle.properties`            |
| Full Xcode and simulator     | Build/run iOS on macOS                         | Command Line Tools alone are insufficient for iOS builds               |
| Ruby 3.3+ and Bundler        | CocoaPods, Xcode project scripts, and fastlane | `Gemfile`                                                              |
| Python 3 and Git             | Maintain the native patch generator            | Python is unnecessary for app development; Git is also used by `--git` |

Tested versions are a snapshot, not an instruction to install the latest version of every tool. Follow project configuration to keep dependencies compatible.

```sh
node --version
pnpm --version
java -version
```

For iOS also check:

```sh
ruby --version
bundle --version
xcodebuild -version
```

If `bundle` is unavailable, install Bundler for your managed Ruby 3.3+. macOS system Ruby may not satisfy the Gemfile. See [dependencies and patches](dependencies-and-patches.md).

## 3. Install template dependencies

```sh
pnpm install --frozen-lockfile
pnpm run doctor
```

Installation automatically applies dependency patches; the Python patch script is not required for initial setup.

Doctor reports `PASS`, `FAIL`, and `SETUP` notes. It checks some tools and configuration but does not certify every feature. On macOS it also checks Xcode even for Android work; an Xcode failure does not necessarily indicate an Android build failure. It does not fully validate tool versions or SDK setup.

## 4. Create an application

See generator options with `pnpm create-app --help`, the catalog with `pnpm list:modules`, state managers with `pnpm list:states`, and API options with `pnpm list:apis`. Select `--modules all` for every capability. This example creates Acme App in `acme-app` with Zustand, core, and UI:

```sh
pnpm create-app --name AcmeApp --slug acme-app \
  --display-name "Acme App" \
  --android-id com.example.acme --ios-id com.example.acme \
  --modules core,ui --state zustand --git --dry-run
```

`--dry-run` only prints the plan. If it is correct, run the same command without that flag:

```sh
pnpm create-app --name AcmeApp --slug acme-app \
  --display-name "Acme App" \
  --android-id com.example.acme --ios-id com.example.acme \
  --modules core,ui --state zustand --git
cd ../acme-app
```

- By default, the target is created next to the template using the app slug. Pass `--target` to choose a different path outside the template. The target must be new and its parent must exist.
- App name, package name, bundle ID, URL scheme, and Android package paths are updated. The scheme uses the slug, for example `acme-app://`.
- The app includes `core` and the modules, state manager, and API technology you select.
- Git history, installed dependencies, build output, recognized caches, and recognized credential files are not copied. See `scripts/lib/files.mjs` for the rules; this does not scan for every possible sensitive file.
- Public service configuration is reset, the API becomes a placeholder, and the APK size baseline is reset.
- pnpm reconciles the lockfile with selected dependencies. `--git` initializes a local repository with empty history.

### What the generated app contains

The generated `README.md` starts empty. Add the product's setup and usage instructions there. The generator keeps the React Native source, Android and iOS projects, tests for the selected app code, and app tools for builds, linting, formatting, branding, Maestro, and fastlane. It includes the [application scripts guide](app-scripts.md) and adds the [Firebase registration guide](app-firebase.md) when Firebase is selected.

The starter `AGENTS.md`, maintainer documentation, `.github/` workflows, generator scripts and tests, dependency audit, and patch maintenance tools stay in the template. The product can choose its own `LICENSE`. `THIRD_PARTY_NOTICES.txt` lists the licenses for copied sources and patches. `licenses/Apache-2.0.txt` accompanies the Gradle Wrapper and the Android text-input drawable from the Android Open Source Project.

The module catalog, service settings, permission and build configuration, package manifest, and pnpm patches reflect the selection. A generated app with no patched packages has no `patches/` directory. If a capability is added later, bring its adapter, dependencies, patches, and relevant native configuration from a compatible version of the template. See [selecting and adding modules](workflow.md#selecting-and-adding-modules).

With `--skip-install`, perform the first install in the generated folder:

```sh
pnpm install --no-frozen-lockfile
```

With `--skip-install`, the first install creates the lockfile from the selected dependencies. Save that lockfile and use `pnpm install --frozen-lockfile` for subsequent installs and CI. If generator installation fails after creating the folder, enter the app folder and retry installation.

## 5. Open the app

Generated apps always have production, dev, and QA flavors. The run commands below open dev. Use `pnpm android qa` or `pnpm ios qa` for QA. See the [flavor guide](flavors.md).

### Android

Start an emulator or connect a device ready for development.

```sh
# Terminal 1 at the app root
pnpm start
```

```sh
# Terminal 2 at the app root
pnpm android
```

The first build usually takes longer while Gradle downloads dependencies and compiles native libraries. TypeScript component changes normally use Metro/Fast Refresh. Adding a native library requires a rebuild.

### iOS

On macOS with the iOS toolchain available:

```sh
# App root; pnpm install has already run
bundle install
pnpm ios:pods
pnpm start
```

In a second terminal:

```sh
pnpm ios
```

When using Xcode directly, open the `ios/<AppName>.xcworkspace` generated after installing Pods. CocoaPods combines the app and dependencies in the workspace. See the [official CocoaPods guide](https://guides.cocoapods.org/using/using-cocoapods.html).

## 6. Check the initial result

```sh
pnpm verify
pnpm format:check
```

The example form accepts input and displays validation, but does not authenticate against a backend. Configure `services.apiBaseUrl` and adapt the API contract before using the API/authentication example.

Next, read the [workflow](workflow.md) to add features, select modules, configure services, and determine when to reinstall or rebuild.
