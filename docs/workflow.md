# Daily workflow and troubleshooting

[Back to README](../README.md) · [Getting started](getting-started.md) · [All scripts](scripts.md) · [Module usage](modules.md)

Run the commands below from the application root containing `package.json` unless stated otherwise. For a new product, work in the generated application folder; the template repository remains the source of the starter catalog.

## Developing a feature

1. Run `pnpm start` in one terminal and `pnpm android` or `pnpm ios` in another. Metro normally refreshes TypeScript changes; native dependency or configuration changes require a rebuild.
2. Put screens, domain components, schemas, requests/queries, and business rules in `src/features/<feature>`. Compose navigation and providers in `src/app`; use `src/core` for shared technical adapters and `src/shared` for shared code that does not know the product domain. Optional capabilities live in `src/modules`. Export feature APIs through `index.ts`.
3. Validate input and responses at boundaries. Replace the example auth/API contract with the product backend contract; the placeholder API does not provide a backend.
4. Run `pnpm verify` and `pnpm format:check`, and add tests appropriate to the change. Check documentation formatting separately with `pnpm exec prettier --check README.md docs`.

### State and layout ownership

Use TanStack Query for server cache, React Hook Form for forms, Redux or Zustand for shared client state, and component state for temporary UI. Store credentials through Keychain and non-secret preferences through MMKV. An offline database is the local source only for features explicitly designed as offline-first. Avoid duplicating the same data across stores.

The root supplies gesture, safe area, and keyboard providers. Use `Screen` or `FormScreen` as appropriate and apply insets only to the area owned by the screen: navigator headers and bottom tabs already manage their own insets. `FormScreen` handles input scrolling, `AppModal` supplies a native surface context, and `Sheet` uses Bottom Sheet keyboard handling. Avoid stacking `KeyboardAvoidingView` without testing its behavior. Test headers, tabs, modals, sheets, orientations, and devices with cutouts. See [architecture](architecture.md) for boundaries.

## Public configuration

Use `pnpm android qa` or `pnpm ios qa` for the QA flavor. Run commands without an argument select dev. Production reads `services`, dev reads `flavorServices.dev`, and QA reads `flavorServices.qa`. See the [flavor guide](flavors.md).

`starter.config.json` is public configuration read by tooling and the application; do not store secrets or credentials in it.

| Section                                                       | Purpose                                                                                       |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `name`, `slug`, `displayName`, `androidId`, `iosId`, `scheme` | App identity; use the generator for a new app because identity is also stored in native files |
| `modules`, `state`                                            | Capability selection and state preset; use the generator or module command as described below |
| `services.apiBaseUrl`                                         | Backend URL; `https://example.invalid` is the default placeholder                             |
| `services.firebase`                                           | Enables Firebase configuration after setting up the module and native registration            |
| `services.googleWebClientId`, `googleIosClientId`             | Public Google Sign-In client IDs                                                              |
| `services.mapsAndroidKey`, `mapsIosKey`                       | Maps client keys restricted to the app identity                                               |
| `services.sentryDsn`                                          | Public DSN; keep the source-map upload token in secure CI                                     |

See [native setup](native-setup.md) for service registration, permissions, and signing. Changes affecting native metadata require module regeneration and a rebuild; test services with the product configuration.

## Selecting and adding modules

When creating an app, select capabilities with `--modules core,ui,media` and state with `--state redux` or `--state zustand`. Core is always included. The template contains the full catalog, but the generator prunes source and dependencies for unselected modules.

In an existing project, `pnpm modules` **replaces the entire selection**. For example, to retain UI and enable media:

```sh
pnpm modules core,ui,media
```

For a Zustand preset app, include `zustand` in the list to keep it active. `pnpm modules zustand` does not convert a Redux implementation to Zustand. Running without arguments returns to core. The command checks manifest dependencies and writes configuration and generated native files, but does not install dependencies or restore pruned source.

To add a module that was not included in a generated app:

1. Compare the module and its dependencies with a compatible template catalog. Bring the required module source and dependencies into the app, including relevant patches and supporting configuration; review changes for compatibility with the app's versions. Do not blindly overwrite product changes.
2. Install dependencies with pnpm, then run `pnpm modules` with the **entire** list to retain. For iOS, run `bundle install` if Ruby tools are not ready, then `pnpm ios:pods` after native dependencies change.
3. Complete the module's service configuration, permissions, and native setup. Rebuild and test on targeted platforms/devices. See [module usage](modules.md) for APIs and requirements.

## Generated and application-owned files

`pnpm modules` updates the modules section of `starter.config.json`, `src/generated/bootstrap.ts`, `src/generated/modules.ts`, `OptionalPackages.kt`, and starter-owned permission, scheme, and service metadata blocks in AndroidManifest/Info.plist. Manual edits inside generated blocks may be overwritten. Keep application-owned native declarations outside those blocks. Feature source, public service configuration, backend integration, and signing are application responsibilities; regenerate when service changes affect generated blocks.

## Common problems

| Symptom                                                    | What to check                                                                                                                                              |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm doctor` gives unexpected results                     | Use `pnpm run doctor`; pnpm has its own `doctor` command. Read each check, including `SETUP`.                                                              |
| First install after `--skip-install` fails on the lockfile | Run `pnpm install --no-frozen-lockfile` in the generated folder to reconcile it, then use frozen lockfile for subsequent installs.                         |
| Module or package import is missing                        | Ensure module source and dependencies are present, then select the entire desired module list. `pnpm modules` does not restore source or install packages. |
| Native module missing or native changes not visible        | Ensure the module is active and dependencies installed; on iOS run Pods after native changes, then rebuild and reinstall.                                  |
| `bundle` or `pod` fails                                    | Check Ruby 3.3+, Bundler, and Xcode, then run `bundle install` before `pnpm ios:pods`. See [dependencies and patches](dependencies-and-patches.md).        |
| Example API fails                                          | The default `apiBaseUrl` is a placeholder; configure the backend and adapt the request/response contract.                                                  |
| Push, login, maps, or telemetry fails                      | Check active modules, service configuration, and app native registration; test services and permissions on a device. See [native setup](native-setup.md).  |

## Release readiness

Run code checks and release builds for selected platforms and modules, then test product flows, permissions, lifecycle, accessibility, and services on devices. Configure signing and distribution through the app/CI. Check artifact size and native alignment as appropriate; also verify on a 16 KB device rather than relying only on binary checks. See the [script reference](scripts.md) for commands and effects and [validation](validation.md) for starter test results and limits. A previously passing starter build does not replace testing the product configuration.
