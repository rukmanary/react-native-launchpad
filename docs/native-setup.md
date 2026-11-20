# Native and service setup

[Back to README](../README.md) · [Workflow](workflow.md) · [Dependencies and patches](dependencies-and-patches.md)

## Toolchain

Use Node 24, the pnpm version in `packageManager`, JDK 17, Android SDK/NDK as specified in `android/build.gradle`, and full Xcode and CocoaPods for iOS. Doctor does not display credential or environment file contents.

## Identity and services

Production, dev, and QA each have their own IDs, launcher names, URL schemes, and service configuration. See the [flavor guide](flavors.md).

Use the generator to change the name and IDs. Editing `starter.config.json` alone does not rename all package source paths or Xcode identifiers.

- Firebase: provide Android/iOS registration files for each flavor ID and enable the SDK in the corresponding service configuration. For push, set up APNs, provisioning, and the relevant capabilities. See [Firebase setup per flavor](flavors.md#firebase-google-and-maps).
- Google Sign-In: supply the public web and iOS client IDs; register the Android SHA and the iOS reversed-client-ID URL scheme. Run `pnpm modules` with the same selection to regenerate the scheme.
- Maps: set `mapsAndroidKey`/`mapsIosKey` to client keys restricted by application ID/SHA/bundle ID. The location module installs the Google subspec for iOS; select the Google provider in the component when needed. Apple Maps remains available without a Google key.
- Sentry: set the public DSN; upload source maps through CI holding the token. Do not put the upload token in `starter.config.json`. Android can enable the upload script with `-PuploadSentry`.
- Notifications: choose one presentation owner per message. RN Notifications native registration and Notify Kit are not two paths for displaying the same push.
- Biometrics, camera, microphone, gallery, GPS, push, and Google login require device/service QA.
- fastlane: build lanes are available; upload, distribution, and signing do not run automatically.

## Native dependency selection

Autolinking disables native packages belonging to unselected modules in the template. Generated apps keep the native setup for their selected modules. React Native Nitro Image follows camera. Graphics uses Dimezis BlurView on Android and Community Blur on iOS. The Android JitPack repository is included for graphics and media, which uses [uCrop](https://github.com/Yalantis/uCrop).

`pnpm modules` writes the starter's permission and URL scheme blocks. Application-owned permission declarations must remain outside generated blocks.

## Release and size

Release uses Hermes, R8, and resource shrinking. Release builds deliberately do not use the debug signing key. AAB is intended for Play; `-PsplitApk` produces an APK per ABI. Supply production signing through application/CI configuration and do not commit the keystore.

The default ABIs are arm64-v8a and x86_64. `pnpm android:apk` produces separate APKs per ABI; `pnpm android:apk:arm64` builds only ARM64. The tested size baseline uses ARM64. Support for 32-bit devices must be explicitly added and tested against every selected module.

Run `size:check` against artifacts with consistent names and profiles. AAB file size is not device download size. To simulate Play, use `bundletool build-apks` with a device spec, followed by `get-size total`. Asset optimization uses a separate output directory, a maximum dimension of 1920px, and WebP quality 82. Image uploads are limited to 10 MB; video compression requires a separate pipeline.

## Device matrix

Test minimum Android, API 35/36/37; gesture and three-button navigation; portrait/landscape; cutouts/tablets if supported; long forms, multiline, and autofill; headers/tabs/modals/sheets; TalkBack/VoiceOver and large fonts; and background/resume/process death. All direct and transitive `.so` files must also be tested on a device or emulator with 16 KB page size, in addition to binary alignment checks.
