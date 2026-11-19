import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { defer, map, mergeMap, timeout } from 'rxjs';
import { ApiError } from '../http/errors';
import { resolveTrustedUrl } from '../http/transport';

type GraphQLSession = {
  version: () => number;
  read: () => Promise<{ accessToken: string } | null>;
};

export function createGraphQLClient(endpoint: string, session: GraphQLSession, fetcher = fetch) {
  const base = new URL(endpoint);
  const transport = new HttpLink({
    uri: endpoint,
    fetch: (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      return fetcher(resolveTrustedUrl(base, url), init);
    },
  });

  const authenticate = new ApolloLink((operation, forward) =>
    defer(async () => {
      const version = session.version();
      const token = (await session.read())?.accessToken;
      ensureSession(version);

      if (token) {
        operation.setContext(({ headers = {} }) => ({
          headers: { ...headers, authorization: 'Bearer ' + token },
        }));
      }

      return version;
    }).pipe(
      mergeMap((version) =>
        forward(operation).pipe(
          map((result) => {
            ensureSession(version);
            return result;
          }),
        ),
      ),
      timeout({ first: 15_000 }),
    ),
  );

  function ensureSession(version: number) {
    if (session.version() !== version) throw new ApiError('aborted', 'Session changed');
  }

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: authenticate.concat(transport),
  });
}
