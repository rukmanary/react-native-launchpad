# UI starter kit

[Back to README](../README.md) · [Optional modules](modules.md)

Open **UI starter kit** on the dashboard to preview the shared components. The preview has a form, buttons, a modal, and a language control backed by the selected store. Components are exported from `src/shared/ui/index.ts`.

| Need                    | Components                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------- |
| Layout and insets       | `Screen`, `FormScreen`, `ScreenFooter`, `AppModal`                                      |
| Typography and surfaces | `AppText`, `Card`, `Badge`, `Divider`                                                   |
| Actions and feedback    | `Button` with primary and secondary variants, `AsyncState`, `Icon`, `AnimatedPressable` |
| Inputs                  | `TextField` for a controlled input, `FormField` for React Hook Form                     |
| Theme                   | Colors, spacing, and radii from `src/shared/theme/theme.ts`                             |

```tsx
<Card>
  <AppText variant="heading">Contact details</AppText>
  <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
  <Button label="Save" loading={saving} onPress={save} />
</Card>
```

Choose `--modules ui` for bottom sheets, date and calendar fields, OTP input, carousel, pager, and guided tours. Other capabilities ship with their own wrappers. For example, `media` includes image and video views, `graphics` includes charts and blur, and `chat` includes a controlled message view. Keep only the capabilities you use in the product.

## Package coverage

An inventory of the 78 direct runtime dependencies found direct source references for 74. The remaining four support other integrations:

| Package                      | Used by                                       |
| ---------------------------- | --------------------------------------------- |
| `react-native-screens`       | React Navigation native stack                 |
| `react-native-worklets`      | The Babel plugin and Reanimated runtime       |
| `react-native-nitro-modules` | MMKV and the Nitro-based camera/image modules |
| `react-native-nitro-image`   | VisionCamera's photo output integration       |

Packages serve different roles. The core and optional modules provide components, hooks, and service adapters. Babel, Metro, Jest, ESLint, Prettier, and the native build tools are configured where they are used. The module guide lists the available wrapper APIs. Check the validation record for build and device coverage. Firebase, Google, Maps, Sentry, and other external integrations require app-specific setup. [Module guide](modules.md) · [Validation](validation.md).
