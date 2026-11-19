# Validation

The results below cover the starter configurations tested on November 19, 2026. Retest your app when changing modules, signing, backends, or build tools.

## State, API, and UI kit checks

- TypeScript, ESLint, Prettier, 20 Jest tests, 3 script tests, and frozen lockfile installation passed in the template.
- Generated Recoil + GraphQL, MobX + REST, and Zustand + REST projects passed offline installation and verification. These checks confirmed pruning of unused state and API dependencies. The Recoil + GraphQL Android release JavaScript bundle also passed Metro bundling.
- The Android dev emulator loaded the generated Recoil + GraphQL JavaScript through Metro using the previously built core dev APK. Maestro opened the UI starter kit, changed the Recoil language preference, and displayed a product from a local GraphQL fixture server.
- Apollo tests verified authorization headers, cache reuse, rejection of an overridden cross-origin endpoint, and rejection of stale-session responses before caching. The REST regression suite covered the existing timeout, cancellation, and refresh behavior after the client refactor.

## Flavor and generator checks

- TypeScript, ESLint, Prettier, 16 Jest tests, and 3 script tests passed. The new tests covered module selection and service isolation based on the native app ID.
- The generator created a temporary project with distinct Android and iOS IDs, the Zustand preset, UI module, three Xcode schemes, and matching deep links.
- Android core built for ARM64 in `devDebug`, `qaRelease`, and `productionRelease`. The package IDs, launcher names, and URL schemes were checked directly in all three APKs. `pnpm android:bundle production` also built the ARM64 AAB.
- All three flavors were installed side by side and passed the Maestro form smoke test. Dev used Metro and passed after updating Rozenite's MMKV v4 adapter. Both test-signed release APKs passed ELF alignment checks for 23 native libraries. Production also passed ZIP alignment. The production test APK measured **29,812,179 bytes**.
- The Xcode project, schemes, plist, and Podfile syntax passed static checks. The local Xcode installation lacked CoreSimulator, so iOS builds remain unverified. Service registrations and production signing are also unverified.

## Earlier checks

| Check                                                 | Result                                                                                                                   |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Frozen offline pnpm install                           | Lockfile was consistent                                                                                                  |
| Strict TypeScript                                     | All catalog adapters checked                                                                                             |
| ESLint and Prettier                                   | Passed                                                                                                                   |
| Jest and React Native Testing Library                 | 3 suites, 15 tests                                                                                                       |
| Node generator tests                                  | 2 tests covering IDs and paths, dry run, source isolation, dependency pruning, existing targets, and size baseline reset |
| Generated Zustand project                             | Generation, offline install, and TypeScript passed. Redux dependencies were pruned                                       |
| Repeated module configuration and branding            | Formatting, plist, and generated configuration blocks stayed valid                                                       |
| Asset compression                                     | Five sample PNG assets became WebP in a separate output directory                                                        |
| Android core debug and release                        | ARM64 builds passed. Release used R8 and resource shrinking                                                              |
| Android catalog excluding Firebase, debug and release | ARM64 builds passed with the compatibility patches in `patches/`                                                         |
| Core release Maestro                                  | Launch, navigation, email and password input, and form validation passed on API 37                                       |
| ELF alignment                                         | All 23 core and 33 catalog libraries met the 16 KB minimum                                                               |
| ZIP alignment                                         | Both APK profiles passed `zipalign -P 16`                                                                                |
| Rozenite in core release                              | The source map contained no `@rozenite` sources                                                                          |
| iOS and Ruby syntax                                   | Info.plist, Podfile, Gemfile, Fastfile, and the iOS setup script passed syntax checks                                    |

The catalog release without Firebase also passed the launch, navigation, and form smoke flow. Runtime testing caught a Notifications startup crash caused by legacy host access. The fix is in `react-native.config.js` and the Notifications patch. Token callbacks use the modern `ReactHost`.

The catalog build used a separate generated project with core, graphics, offline, biometrics, camera, media, location, notifications, content, UI, chat, Google Sign-In, and Sentry. It verified compilation, linking, R8, and the smoke flow for that project.

HTTP and session tests covered external origins, response schemas, HTTP errors, 204 responses, concurrent refresh, logout during refresh, abort before transport, mutation retry behavior, refresh and body timeouts, stale credential writes, and a corrupted credential read during a new login. Component tests covered button accessibility and interaction.

## Size and device

The pre-flavor ARM64 core release APK measured **29,754,975 bytes / 28.38 MiB**, including debug signing for testing. `config/size-budget.json` now tracks the flavored production APK by filename. The generator resets the baseline for each new app.

The test-signed release APK for the catalog excluding Firebase measured **61,757,443 bytes / 58.90 MiB**. Each optional capability contributes to product size.

The test device was a Medium Phone API 37 ARM64 emulator with a **4,096-byte page size**. The form inputs and submit button remained accessible with the keyboard open in that setup. Verify runtime behavior separately on 16 KB devices.

## Remaining validation

- iOS dependency installation and builds. CocoaPods 1.17.0 was detected. A full Xcode setup with CoreSimulator is needed for simulator build and run checks, along with Bundler, Pods, and archive validation.
- Firebase native and cloud integrations. The TypeScript adapters are available. FCM, APNs, analytics, crashes, Remote Config, performance, authentication, and database behavior require the app's service registrations and integration tests.
- Google Sign-In, maps, the auth backend, remote push, a physical camera, biometrics, WatermelonDB backend sync, and telemetry uploads.
- The full keyboard, landscape, cutout, tablet, large-text, TalkBack, VoiceOver, background, process death, minimum Android version, x86_64, and 16 KB runtime matrix.
- Production signing, fastlane archive and distribution, GitHub Actions execution, and device delivery size through Play. An ARM64 production AAB build was verified as noted above.

The sample API points to `example.invalid`. The demo form performs local validation. Supply your app's service settings to test real backend behavior.

Local logs live under `artifacts/`, which Git and the generator exclude. Use `pnpm verify`, `pnpm format:check`, `pnpm run doctor`, the `native-modules` workflow, and the native setup device matrix for your project.
