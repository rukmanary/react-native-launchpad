# Compatibility

[Back to README](../README.md) · [Dependencies and patches](dependencies-and-patches.md) · [Validation](validation.md)

`config/dependency-audit.json` records a registry snapshot. `package.json` and `pnpm-lock.yaml` record the selected versions. Check native compatibility separately when considering a newer release.

## Version choices

- React Native 0.88.1 and React 19.3.1.
- Skia 2.15.5 satisfies Victory Native 43.1.0's `>=2.15.5 <3` range. Use the selected `react-native-skia` package alone to avoid duplicate native modules from `@shopify/react-native-skia`.
- Babel 7 matches the React Native preset. TypeScript 6.0.3 matches the selected typescript-eslint parser.
- Vector icons use the single `@react-native-vector-icons/lucide` family.
- Android blur uses Dimezis `version-4.0.0`. Community Blur provides the iOS implementation. Test the wrapper on devices.
- React Native Testing Library 14 uses `test-renderer`.
- Both Notify Kit catalog entries refer to the same dependency.
- GiftedChat is in maintenance mode. Review native behavior when upgrading packages such as FS, Render HTML, Biometrics, and Geolocation.
- Maestro runs as an external CLI. fastlane is a Ruby gem.
- On November 18, 2026, the RubyGems versions selected were fastlane 2.242.0, CocoaPods 1.17.0, and xcodeproj 1.28.1. The Gemfile requires Ruby 3.3+. Bundler and CocoaPods installation passed for the full showcase profile.
- The optional VisionCamera barcode scanner and ML Kit require iOS 15.5. The generator applies that target across all flavors with `camera` enabled.
- pnpm 12 uses `allowBuilds` to control dependency lifecycle scripts.
- Rozenite is development-only and network recording is opt-in.
- Firebase Performance uses Gradle plugin 2.0.2 for Android Gradle Plugin 9 compatibility.
- Android uses Kotlin 2.4.21 with AGP 9.2.1. The selected Firebase Auth SDK publishes Kotlin 2.4 metadata.

For an upgrade, refresh metadata, check peer ranges, select compatible versions, run `pnpm install` and `pnpm verify`, build the affected native profiles, test release behavior and 16 KB alignment, and record the results. Review `scripts/sync-dependencies.mjs` before using it. The internal bootstrap script can overwrite the package name, scripts, and compatibility pins.

## Android patches

Version-specific patches fix older Android namespaces, Date Picker and Notifications ProGuard settings, and WatermelonDB and Notifications BuildConfig generation under AGP 9. pnpm applies them through `patchedDependencies`. Generated apps keep only patches for selected packages. `prepare-native-patches.py` regenerates patches in a temporary directory and leaves the package store untouched. Validate builds before retiring a patch.

Enable BuildConfig per library using [Android BuildFeatures](https://developer.android.com/reference/tools/gradle-api/8.4/com/android/build/api/dsl/BuildFeatures).

The `location` module keeps three WorkManager constructors used by reflection. These narrow R8 rules prevent the native release startup crash from react-native-maps' WorkManager 2.9.1 dependency. Generated apps keep the rules with `location`.

The `ui` module keeps the Time4J classes required by the Date Picker, including the resource loader constructor used by reflection in minified Android builds.

The Date Picker patch also resolves the presenting window through React Native's iOS scene lifecycle and removes the TurboModule provider entry for its legacy iOS view manager. CocoaPods continues to generate the Fabric view provider.

The `camera` module preserves the constructors ML Kit uses to load barcode-scanning components from the Android manifest in minified builds.

The VisionCamera 5.2.4 patch uses a runtime interface check in two generated view managers so they compile with Kotlin 2.4 and retain the same recycling behavior.

Notifications overrides autolinking in `react-native.config.js` because `PackageList(Application)` does not expose the legacy `reactNativeHost`. The token callback tries `ReactHost` first and waits for Firebase setup before requesting an FCM token. The Android remote registration adapter also checks that Firebase is enabled. Local notifications remain available.

A transitive `@expo/require-utils` peer warning requests TypeScript 5 while the source checks use TypeScript 6.0.3. This is a bare React Native app. Check any Expo tooling separately and review deprecated packages when upgrading.

Recoil 0.7.7 is archived upstream. The selected React 19 renderer workaround lives in `patches/recoil@0.7.7.patch` for the native, CJS, and ESM entry points. The test suite exercises atom updates under React 19. See [state and API presets](state-and-api.md).
