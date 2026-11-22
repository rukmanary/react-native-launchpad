# Firebase registration by flavor

Create a Firebase app registration for each platform and flavor you build. Use the Android application ID or iOS bundle ID in [starter.config.json](../starter.config.json), with `.dev` for dev and `.qa` for QA. Production uses the base IDs.

| Platform | Registration file path                           |
| -------- | ------------------------------------------------ |
| Android  | `android/app/src/<flavor>/google-services.json`  |
| iOS      | `ios/Firebase/<flavor>/GoogleService-Info.plist` |

On macOS, install the tools listed in the [application scripts guide](app-scripts.md#install-and-run), then check the files before building:

```sh
pnpm ios:services qa
```

`pnpm ios:services` with no flavor checks all three iOS file paths. It checks that the expected files exist. The Xcode build phase checks the bundle ID and copies the selected file into the app bundle.

To start the JavaScript Firebase integrations, set `firebase` to `true` under `services` for production or `flavorServices.<flavor>` for dev and QA. Rebuild the affected flavor after adding its registration files or changing native configuration.

Android flavors with `firebase` disabled can build with the Firebase module installed and no registration file. When `firebase` is enabled for a flavor, Gradle requires its registration file.
