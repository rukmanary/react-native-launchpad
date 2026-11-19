# Production, dev, and QA flavors

[Back to README](../README.md) · [Script reference](scripts.md) · [Native setup](native-setup.md)

The generator gives every app three flavors. `--android-id` and `--ios-id` set the production IDs. Dev and QA add a suffix, while Kotlin source keeps the base namespace.

| Flavor       | Example Android or iOS ID | Launcher name | Deep link         | Xcode scheme |
| ------------ | ------------------------- | ------------- | ----------------- | ------------ |
| `production` | `com.example.acme`        | Acme App      | `acme-app://`     | `AcmeApp`    |
| `dev`        | `com.example.acme.dev`    | Acme App Dev  | `acme-app.dev://` | `AcmeAppDev` |
| `qa`         | `com.example.acme.qa`     | Acme App QA   | `acme-app.qa://`  | `AcmeAppQA`  |

A flavor selects the app identity and service settings. A build type determines how the app is built. Android `qaDebug` uses Metro, while `qaRelease` includes a JavaScript bundle for distribution testing. Gradle combines the product flavor and build type. [Android build variants](https://developer.android.com/build/build-variants).

## Run and build

| Task                      | Android                                                               | iOS                                                |
| ------------------------- | --------------------------------------------------------------------- | -------------------------------------------------- |
| Run dev with Metro        | `pnpm android`                                                        | `pnpm ios`                                         |
| Run QA with Metro         | `pnpm android qa`                                                     | `pnpm ios qa`                                      |
| Run production with Metro | `pnpm android production`                                             | `pnpm ios production`                              |
| Build QA release          | `pnpm android:release qa`                                             | Scheme `<AppName>QA` and configuration `ReleaseQA` |
| Build production release  | `pnpm android:release production` or `pnpm android:bundle production` | Scheme `<AppName>` and configuration `Release`     |

Start Metro with `pnpm start` for debug builds. Release APKs appear in `android/app/build/outputs/apk/<flavor>/release/` and AABs in `android/app/build/outputs/bundle/<flavor>Release/`. `pnpm android:apk qa` builds an APK per ABI. `pnpm android:apk:arm64 qa` builds for ARM64 only. Android release builds are unsigned by default.

On iOS, run `bundle install` and `pnpm ios:pods` before building. Dev uses `DebugDev` and `ReleaseDev`, QA uses `DebugQA` and `ReleaseQA`, and production uses `Debug` and `Release`. Archive uses the selected scheme's release configuration. Run QA release on the simulator with `pnpm ios qa --mode ReleaseQA`. [Xcode schemes](https://developer.apple.com/documentation/xcode/customizing-the-build-schemes-for-a-project).

Fastlane accepts `flavor:qa` or `flavor:dev` and defaults to production.

```sh
bundle exec fastlane android build flavor:qa
bundle exec fastlane ios build flavor:qa
```

To smoke-test an installed app, run `pnpm e2e qa android` or `pnpm e2e qa ios`. The default is dev on Android. The flow clears data for the selected app ID.

## Service settings by flavor

In `starter.config.json`, production reads `services`, dev reads `flavorServices.dev`, and QA reads `flavorServices.qa`.

```json
{
  "services": { "apiBaseUrl": "https://api.example.com" },
  "flavorServices": {
    "dev": { "apiBaseUrl": "https://dev-api.example.com" },
    "qa": { "apiBaseUrl": "https://qa-api.example.com" }
  }
}
```

The runtime selects settings from the installed native app ID. Unconfigured dev and QA builds use `https://example.invalid`, leave Firebase disabled, and use empty DSN, Google, and Maps values. The generator resets service settings for all three flavors when creating a project. GraphQL apps set `graphqlUrl` at the same scope. [State and API presets](state-and-api.md).

After editing iOS settings such as the Google client ID or Maps key, run `pnpm modules` again with the same active module list. It regenerates `ios/Config/*.xcconfig` and the relevant plist and manifest blocks. Rebuild to pick up the new native metadata.

### Firebase, Google, and Maps

Enable the `firebase` module and register each app ID in Firebase. Set `firebase: true` in the service settings for any flavor that should enable the JavaScript adapter. Provide the registration file for the flavor you are building.

| Flavor     | Android                                           | iOS                                                |
| ---------- | ------------------------------------------------- | -------------------------------------------------- |
| Production | `android/app/src/production/google-services.json` | `ios/Firebase/production/GoogleService-Info.plist` |
| Dev        | `android/app/src/dev/google-services.json`        | `ios/Firebase/dev/GoogleService-Info.plist`        |
| QA         | `android/app/src/qa/google-services.json`         | `ios/Firebase/qa/GoogleService-Info.plist`         |

The Google Services Gradle Plugin uses the Android source set. On iOS, a build phase checks the bundle ID and copies one plist for the active flavor. `pnpm ios:services qa` checks for the QA plist. Git ignores both registration filenames.

For Google Sign-In, set client IDs per flavor and register the matching Android app ID, signing fingerprint, and iOS bundle ID. Restrict Maps client keys to the corresponding application IDs. Verify APNs, provisioning, and service settings for each ID you use.
