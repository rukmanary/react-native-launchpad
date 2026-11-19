# State and API presets

[Back to README](../README.md) · [Script reference](scripts.md) · [Architecture](architecture.md)

The generator selects state management and API technology independently. The defaults are Redux Toolkit and REST.

```sh
pnpm list:states
pnpm list:apis

pnpm create-app --name ShopApp --android-id com.example.shop \
  --target ../shop-app --modules core,ui --state mobx --api graphql
```

| Flag        | Options                              | Controls                                                |
| ----------- | ------------------------------------ | ------------------------------------------------------- |
| `--state`   | `redux`, `zustand`, `mobx`, `recoil` | Shared client state                                     |
| `--api`     | `rest`, `graphql`                    | The API provider, server cache, and catalog integration |
| `--modules` | `core,ui,media` or `all`             | Optional capabilities, independently of state and API   |

The generator keeps the selected provider, sample integration, and dependencies. Preview your choices with `--dry-run`. The resulting `state` and `api` fields describe the wired presets. To migrate an existing app, update its provider, dependencies, and adapters together.

## State management

Open **UI starter kit** from the app dashboard. The language control uses the selected store, updates i18next, and saves the preference to MMKV. The stable `useAppLanguage()` hook exposes the same interface in all presets. See `src/app/store/presets/` for the Redux slice, Zustand store, MobX observable and reaction, or Recoil atom. Keep auth credentials in Keychain and server data in the selected API cache.

| Preset        | Version            | Implementation                                                                                        |
| ------------- | ------------------ | ----------------------------------------------------------------------------------------------------- |
| Redux Toolkit | See `package.json` | Store, slice, typed dispatch and selector, React Redux provider                                       |
| Zustand       | See `package.json` | Selector-based store                                                                                  |
| MobX          | 7.1.7              | Observable and actions, connected to React with `useSyncExternalStore` and a disposable MobX reaction |
| Recoil        | 0.7.7              | `RecoilRoot` and an atom with a pinned React 19 compatibility patch                                   |

The Recoil repository is archived. The starter's patch is scoped to its legacy renderer check. The default remains Redux Toolkit. [Upstream React 19 issue](https://github.com/facebookexperimental/Recoil/issues/2318).

## REST

Set `apiBaseUrl` for the intended flavor in `starter.config.json`. The catalog queries `GET /products` with fetch and TanStack Query. The request client validates the response and can share a single token refresh when configured. Follow the flow in [HTTP client](http-client.md).

## GraphQL

Set `graphqlUrl` to the full GraphQL endpoint for the intended flavor. Apollo Client 4.3.8, GraphQL 17.1.0, and RxJS 7.8.2 are pinned. The catalog demonstrates a typed query and checks its payload with Zod. Change the example query and schema to match your backend.

```graphql
query StarterProducts {
  products {
    id
    name
    price
  }
}
```

The Apollo provider supplies an `InMemoryCache`. The transport attaches a bearer token from the existing session when available, rejects requests to another origin, and rejects responses from a stale session before they reach the cache. Logout clears the selected API cache. Implement server-specific login and GraphQL token renewal if your backend requires them. The REST client's 401 refresh policy remains in the REST transport.

For dev and QA, set the endpoint under `flavorServices.dev` or `flavorServices.qa`. Production uses `services`. Each unset endpoint defaults to `example.invalid`. [App flavors](flavors.md).
