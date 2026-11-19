# React Native Starter Pack

A bare React Native template with pnpm, TypeScript, feature-based architecture, and selectable native modules. The project includes editable Android and iOS source.

## Documentation

| What you need                                                   | Guide                                                                       |
| --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Set up the toolchain and create an app                          | [Getting started](docs/getting-started.md)                                  |
| Find script options, outputs, and side effects                  | [Script reference](docs/scripts.md)                                         |
| Build dev, QA, and production and configure services for each   | [App flavors](docs/flavors.md)                                              |
| Understand Bundler, CocoaPods, lockfiles, and patches           | [Dependencies and patches](docs/dependencies-and-patches.md)                |
| Develop features, add modules, and troubleshoot                 | [Development workflow](docs/workflow.md)                                    |
| Understand the project structure and state ownership            | [Architecture](docs/architecture.md)                                        |
| Use a module's components or APIs                               | [Module guide](docs/modules.md)                                             |
| Configure native builds, Firebase, Google Sign-In, and releases | [Native setup](docs/native-setup.md)                                        |
| Review version choices and test results                         | [Compatibility](docs/compatibility.md) and [Validation](docs/validation.md) |

## Template and generated app

The template repository keeps the full dependency and adapter catalog. Only `core` is active by default for native autolinking. The generator creates a separate app folder with the source and dependencies for your selected modules. Use that folder for product development and keep the template for future apps.

## Create an app

List the available commands and choices from the template root, where `package.json` lives.

```sh
pnpm create-app --help
pnpm list:modules
pnpm list:states
```

`--modules core,ui` includes the foundation and optional UI components. Choose capabilities from `pnpm list:modules` or use `--modules all` for the full catalog. `--state` chooses Redux Toolkit or Zustand. `--git` initializes a Git repository in the new folder.

Every app includes production, dev, and QA flavors. With `com.example.acme` as the base ID, the installed IDs are `com.example.acme`, `com.example.acme.dev`, and `com.example.acme.qa`. Run commands default to dev. Release APK and AAB commands default to production. [App flavors](docs/flavors.md).

```sh
pnpm install --frozen-lockfile

pnpm create-app --name AcmeApp --slug acme-app \
  --display-name "Acme App" \
  --android-id com.example.acme --ios-id com.example.acme \
  --target ../acme-app --modules core,ui --state zustand --git

cd ../acme-app
```

This creates Acme App in a new folder, installs dependencies, sets the native identity, and initializes Git with an empty history. Choose a target path that does not exist. Add `--dry-run` to preview the plan or `--skip-install` to defer dependency installation. Redux Toolkit is the default state manager.

## Run Android

Install Node, pnpm, JDK 17, and the Android SDK, then start an emulator or connect a device. See the project's [toolchain versions](config/toolchain.json) and [Gradle settings](android/build.gradle).

```sh
# Terminal 1, from the app root
pnpm start
```

```sh
# Terminal 2, from the app root
pnpm android
```

`pnpm start` runs Metro, which serves the development JavaScript bundle. `pnpm android` builds, installs, and launches the app. Use Bundler for fastlane workflows when needed. The Android CLI and Gradle run independently of the Ruby toolchain.

## Run iOS

On macOS with full Xcode, Ruby 3.3 or newer, and Bundler, run these commands from the app root.

```sh
bundle install
pnpm ios:pods
pnpm start
```

In a second terminal, run:

```sh
pnpm ios
```

`bundle install` installs Ruby tools, including CocoaPods. `pnpm ios:pods` uses CocoaPods to integrate native iOS dependencies. `pnpm install` installs JavaScript packages. [Dependencies and patches](docs/dependencies-and-patches.md).

## Common commands

| Task                                  | Command                                       |
| ------------------------------------- | --------------------------------------------- |
| Run the JavaScript development server | `pnpm start`                                  |
| Run the app                           | `pnpm android` or `pnpm ios`                  |
| Check code before a commit            | `pnpm verify` followed by `pnpm format:check` |
| Format files                          | `pnpm format`                                 |
| Check toolchain prerequisites         | `pnpm run doctor`                             |

Use `pnpm run doctor` to run the starter's checks. `pnpm doctor` invokes pnpm's built-in command. `pnpm verify` runs TypeScript, ESLint, Jest, and generator tests. Run native builds, formatting checks, and Maestro separately.

## Connect product features

Public settings live in `starter.config.json`. The sample API starts at `https://example.invalid`. Connect your backend to use the API example. The demo form validates input locally. Set up Firebase, Google Sign-In, maps, push notifications, and telemetry with the app's own service settings.

The root provides safe area, gesture, and keyboard providers. Choose a layout component based on the screen's header, tabs, modal, or bottom sheet. [Development workflow](docs/workflow.md).

Android builds and smoke tests are recorded in the validation guide, alongside the remaining iOS, cloud service, and production signing checks. [Validation](docs/validation.md).

Upstream license notices cover the scaffold, excerpts in `patches/`, and third-party native files. [Third-party notices](THIRD_PARTY_NOTICES.txt).
