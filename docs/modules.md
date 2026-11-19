# Module guide

[Back to README](../README.md) · [Development workflow and module selection](workflow.md) · [Native setup](native-setup.md)

Select the full active module list with `pnpm modules core,<name>,...`, rebuild the native app, and import the public API from `src/modules/<name>`. The command replaces the previous selection. If a generated app omitted a module, restore its adapter source and install its dependencies as part of adding it. Call adapters from product features to keep SDK integration out of screens. [Selecting and adding modules](workflow.md#selecting-and-adding-modules).

| Module        | Main public APIs                                                                                                                                                                 | Setup and ownership                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| core          | api, session, preferences, Screen, FormScreen, Button, FormField, Icon, AnimatedPressable                                                                                        | HTTP and auth, secure credentials, state, forms, native stack and tab navigation, FlashList, localization, dates |
| graphics      | GradientSurface, StatusIllustration, LineChart, CheckIllustration, BlurTarget, BlurSurface                                                                                       | Skia 2 for Victory, Dimezis on Android, Community Blur on iOS                                                    |
| ui            | SheetProvider, Sheet, SheetTextField, DateInput, CalendarInput, OtpEntry, ControlledOtp, AppCarousel, AppPager, TourProvider, TourStep, StartTour                                | Wrap screens in the required sheet or tour provider and choose one OTP component                                 |
| media         | chooseImage, takeImage, chooseDocument, cacheDocument, cropImage, clearCropCache, AppImage, VideoPlayer, createAudioPlayer, downloadToCache, shareFile, getDeviceSummary         | Pickers return null on cancellation. Video follows focus and lifecycle. Dispose of audio after use               |
| camera        | CameraView                                                                                                                                                                       | VisionCamera 5 photo output is passed to the capture callback                                                    |
| location      | currentLocation, watchLocation, useLocation, AppMap                                                                                                                              | Location watch requires an enabled, focused screen in the foreground. Maps requires provider keys as appropriate |
| biometrics    | checkBiometrics, unlockWithBiometrics, createSigningKey, signServerChallenge, deleteSigningKey                                                                                   | The backend must verify signed challenges. Local unlock and server login are separate flows                      |
| offline       | createDatabase, Note, addNote, observeNotes, deleteNote, syncDatabase                                                                                                            | Sample notes table and schema version 1. The backend defines pull, push, and conflict behavior                   |
| firebase      | firebaseSignIn, firebaseSignOut, observeFirebaseUser, registerPush, observePush, trackEvent, setTelemetryConsent, loadRemoteConfig, measureOperation, observeRecord, writeRecord | App registration, backend configuration, and security rules are required                                         |
| notifications | showNotification, cancelNotification, observeNativeNotifications, requestNativePushRegistration                                                                                  | Choose either Notify Kit or RN Notifications to handle presentation                                              |
| content       | AppWebView, HtmlContent, isAllowedUrl                                                                                                                                            | Allow listed HTTPS origins. Validate onMessage payloads in the feature                                           |
| google        | configureGoogleSignIn, signInWithGoogle, signOutGoogle                                                                                                                           | Configure OAuth client IDs and the app URL scheme                                                                |
| sentry        | initializeTelemetry, captureFailure, TracedApp                                                                                                                                   | Public DSN. The product owns source map upload, sampling, and consent                                            |
| chat          | Chat                                                                                                                                                                             | Controlled UI. The product owns transport, pagination, and delivery status                                       |
| zustand       | usePreferences                                                                                                                                                                   | Alternative to Redux. Choose one owner for preferences                                                           |

## Form example

```tsx
const form = useForm<{ email: string }>({ defaultValues: { email: '' } });
return (
  <FormScreen>
    <FormField control={form.control} name="email" label="Email" keyboardType="email-address" />
  </FormScreen>
);
```

## Media example

```ts
const image = await chooseImage();
if (image?.uri) {
  // Pass the URI to the feature uploader to avoid loading a large file as base64.
}
const file = await chooseDocument();
if (file) {
  const localUri = await cacheDocument(file.uri, file.name ?? 'document');
}
```

## Camera v5

```tsx
<CameraView
  onError={handleError}
  onCapture={async (output) => {
    const photo = await output.capturePhoto({}, {});
    try {
      // Save or copy the photo with the VisionCamera or Nitro Image API.
      // Wait for the save to complete before disposing of the photo.
    } finally {
      photo.dispose();
    }
  }}
/>
```

## Sheet

```tsx
<SheetProvider>
  <Sheet open={open} onClose={() => setOpen(false)}>
    <SheetTextField accessibilityLabel="Name" placeholder="Name" />
  </Sheet>
</SheetProvider>
```

## Android blur

`BlurTarget` and `BlurSurface` must be siblings. Give each screen a unique `targetKey`. Android `SurfaceView` content, such as some camera, map, and video views, may not support blur.

```tsx
<View>
  <BlurTarget targetKey="settings-background">
    <Content />
  </BlurTarget>
  <BlurSurface targetKey="settings-background" radius={16} style={StyleSheet.absoluteFill} />
</View>
```

## Firebase

Set up native registration and enable Firebase in the selected flavor. Call the unsubscribe functions from your cleanup. The sample Remote Config reader parses JSON, so strings must be JSON strings and booleans and numbers must be valid JSON values. Realtime Database reads and writes accept Zod schemas. Enforce authorization and database security rules on the backend. [Service settings by flavor](flavors.md#firebase-google-and-maps).

Send push tokens to the backend using the `onToken` callback or `registerPush`. Notification opens are deduplicated by `messageId`. The entry point background handler runs without UI. Register any product background logic before `AppRegistry`.

Rozenite includes seven plugins. Enable network recording through Controls when needed. Choose an owner and consent policy for Sentry and Crashlytics reporting.
