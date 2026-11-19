# Read the HTTP client

Start with [client.ts](../src/core/http/client.ts) and read `request()` from top to bottom. It resolves the URL, opens a request scope, sends one attempt, retries once if a session refresh succeeds, validates the response, and disposes of the request scope in `finally`.

| File                                                    | Responsibility                                                                     |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [client.ts](../src/core/http/client.ts)                 | Public types and the request flow                                                  |
| [transport.ts](../src/core/http/transport.ts)           | Same-origin URL checks, headers, JSON or FormData body, and fetch                  |
| [request-scope.ts](../src/core/http/request-scope.ts)   | Caller cancellation, deadline, and cleanup for asynchronous stages                 |
| [request-auth.ts](../src/core/http/request-auth.ts)     | Bearer token lookup, session generation checks, and one shared refresh per session |
| [response.ts](../src/core/http/response.ts)             | HTTP status checks, body decoding, and schema validation                           |
| [errors.ts](../src/core/http/errors.ts)                 | Error categories for consumers                                                     |
| [authentication.ts](../src/core/http/authentication.ts) | Example login and refresh endpoints connected to the Keychain session              |

For a feature, provide a path and schema. A query can pass its cancellation signal.

```ts
const products = await api.request({
  path: '/products',
  signal,
  schema: productsSchema,
});
```

The deadline covers token lookup, fetch, refresh waits, and response decoding. Concurrent 401s from the same session share a refresh. A logout or new login invalidates results from the previous session. Transient retries are controlled by the query policy, while mutations use a single normal attempt unless the authentication policy handles a 401.
