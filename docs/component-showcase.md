# Component Showcase

Open **Component** from the bottom tab bar to see the individual component names. Select **Try foundations** to jump to interactive examples on the same screen. Forms and search, dialogs and notifications, FlashList, and optional native demos have their own screens. Use **Preview dark theme** in a default app to preview the catalog and its demo screens, then select **Use app theme** to restore the inherited theme.

## Generate an app with native demos

Run this command from the starter repository to include every showcase module.

```sh
pnpm create-app --name ShowcaseApp --android-id com.example.showcase \
  --modules core,ui,media,camera,graphics,content,location
```

| Included module | Demos                                                                                                                                                                                                                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core`          | Text, view, toggle, modal, custom alert, confirmation, network error, card, button, checkbox, radio, chip, badge, divider, expandable panel, floating button, grid, header, footer, form, text field, FlashList, steps, progress bar, loading, skeleton, toast/snackbar, avatar, dropdown, search, and slider. |
| `ui`            | Bottom sheet, calendar, date picker, OTP/PIN, carousel, pager view, and guided tour.                                                                                                                                                                                                                           |
| `media`         | BlurHash image, document picker, image picker and cropping, audio player, and video player.                                                                                                                                                                                                                    |
| `content`       | WebView and HTML content.                                                                                                                                                                                                                                                                                      |
| `graphics`      | SVG, Skia canvas, gradients, and charts.                                                                                                                                                                                                                                                                       |
| `camera`        | Camera capture, QR scanner, and barcode scanner.                                                                                                                                                                                                                                                               |
| `location`      | Maps and location.                                                                                                                                                                                                                                                                                             |

The catalog lists unavailable demos with the module needed to open them. `pnpm modules` regenerates the screen registry from the selected modules. Choose the capabilities during generation to include their dependencies, native configuration, adapters, and examples.

In **Advanced controls**, swipe across part of the carousel to move one slide. The first slide shows a bundled photo. The second keeps the BlurHash generated from its bundled photo visible so the loading state can be inspected.

In **Media and documents**, the audio player includes two bundled instrumental tracks. Play or pause, drag the timeline to seek, jump 10 seconds in either direction, or select a track from the queue. Choose a speed between 0.5× and 2×. The player keeps that speed across tracks. Playback pauses when the screen loses focus or the app goes to the background.

Camera, audio, video, image and document pickers, and location need platform support and device testing. Configure Maps client keys for the provider and flavor that need them. QR and barcode scanning uses `react-native-vision-camera-barcode-scanner` through the optional camera module. Selecting `camera` sets the iOS deployment target to 15.5 for all three flavors. The core target is 15.1.

## Reuse components

Import core controls from `@/shared/ui` and native components from their respective `@/modules/<name>` entry points. Compose controls rather than importing the demo screens. `Form` accepts a React Hook Form instance, a submit handler, and an error handler. `NetworkErrorModal` renders its retry button when `onRetry` is supplied and accepts a controlled `retrying` state. `AppList` accepts the FlashList props and ref.

`Sheet` manages its full-screen overlay and safe-area insets. Use `SheetTextField` for inputs inside a sheet. Wrap Copilot steps in `TourProvider`. `VideoPlayer`, `AudioPlayer`, `CameraView`, `QrScanner`, and `BarcodeScanner` use navigation focus and app lifecycle to control native activity. Render them within a navigation screen.

## Theme

The component defaults come from `lightTheme`. They work without a `ThemeProvider`. To opt in globally, replace the default re-export in the root `App.tsx` with this wrapper. Use `useTheme()` for semantic colors and layout tokens in custom components.

```tsx
import { App } from '@/app/App';
import { darkTheme, ThemeProvider } from '@/shared/theme/theme';

const ThemedApp = () => (
  <ThemeProvider theme={darkTheme}>
    <App />
  </ThemeProvider>
);

export default ThemedApp;
```

To customize individual values, spread `lightTheme` or `darkTheme`, then spread and override the semantic tokens. Keep foreground and background contrast in both themes.

## Screen layout and Android edge-to-edge

React Native enables edge-to-edge through the Android app configuration. Wrap screen content in `Screen` or use `FormScreen` for keyboard-aware forms. The root safe-area provider supplies the insets, the stack header owns the top edge, and the bottom tabs own the bottom edge. `Screen` adds the remaining insets around the content. Put regular page spacing in the `style` prop.

If you add a navigator with custom or hidden headers, set inset ownership in its `screenLayout` with `ScreenInsetsProvider`. `useScreenInsets()` exposes the remaining inset values for custom surfaces. A fullscreen native modal starts its own safe-area surface. Check cutouts, gesture and three-button navigation, keyboards, landscape, and different screen sizes on devices.
