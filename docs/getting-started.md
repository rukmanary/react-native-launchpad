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

See generator options with `pnpm create-app --help`, the catalog with `pnpm list:modules`, and state managers with `pnpm list:states`. Select `--modules all` for every capability. This example creates Acme App in `acme-app` with Zustand, core, and UI:

```sh
pnpm create-app --name AcmeApp --slug acme-app \
  --display-name "Acme App" \
  --android-id com.example.acme --ios-id com.example.acme \
  --target ../acme-app --modules core,ui --state zustand --git --dry-run
```

`--dry-run` only prints the plan. If it is correct, run the same command without that flag:

```sh
pnpm create-app --name AcmeApp --slug acme-app \
  --display-name "Acme App" \
  --android-id com.example.acme --ios-id com.example.acme \
  --target ../acme-app --modules core,ui --state zustand --git
cd ../acme-app
```

- The target is created outside the template repository and must not already exist.
- App name, package name, bundle ID, URL scheme, and Android package paths are updated. The scheme uses the slug, for example `acme-app://`.
- Unselected module source and dependencies are pruned; core is always included.
- Git history, installed dependencies, build output, recognized caches, and recognized credential files are not copied. See `scripts/lib/files.mjs` for the rules; this does not scan for every possible sensitive file.
- Public service configuration is reset, the API becomes a placeholder, and the APK size baseline is reset.
- pnpm reconciles the lockfile with selected dependencies. `--git` only runs `git init`; it does not create a commit, remote, or GitHub push.

With `--skip-install`, perform the first install in the generated folder:

```sh
pnpm install --no-frozen-lockfile
```

The pruned dependency list differs from the template lockfile. Save the resulting lockfile after a successful first install; subsequent installs and CI use `pnpm install --frozen-lockfile`. If generator installation fails after creating the folder, enter it and retry installation; there is no need to recreate or delete the project.

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
