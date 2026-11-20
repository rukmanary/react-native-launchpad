import { gql } from '@apollo/client';
import { createGraphQLClient } from '@/core/graphql/create-client';

const products = gql`
  query Products {
    products {
      id
    }
  }
`;

const testSession = {
  version: () => 0,
  read: async () => ({ accessToken: 'test-token' }), // pii-allow
};

test('sends a GraphQL query with the session token and caches the response', async () => {
  const transport = jest.fn(
    async () =>
      new Response(JSON.stringify({ data: { products: [{ id: 'one' }] } }), {
        headers: { 'Content-Type': 'application/json' },
      }),
  );
  const client = createGraphQLClient('https://api.example.com/graphql', testSession, transport);
  const first = await client.query({ query: products });
  const cached = await client.query({ query: products });

  expect(first.data).toEqual({ products: [{ id: 'one' }] });
  expect(cached.data).toEqual(first.data);
  expect(transport).toHaveBeenCalledTimes(1);
  expect(transport).toHaveBeenCalledWith(
    'https://api.example.com/graphql',
    expect.objectContaining({
      headers: expect.objectContaining({ authorization: 'Bearer test-token' }), // pii-allow
    }),
  );
});

test('rejects an overridden GraphQL endpoint before sending credentials', async () => {
  const transport = jest.fn();
  const client = createGraphQLClient('https://api.example.com/graphql', testSession, transport);

  await expect(
    client.query({
      query: products,
      context: { uri: 'https://other.example.com/graphql' },
    }),
  ).rejects.toMatchObject({ kind: 'configuration' });
  expect(transport).not.toHaveBeenCalled();
});

test('rejects a response from a session that changed while the query was in flight', async () => {
  let sessionVersion = 0;
  let markStarted!: () => void;
  let finish!: (response: Response) => void;
  const started = new Promise<void>((resolve) => {
    markStarted = resolve;
  });
  const client = createGraphQLClient(
    'https://api.example.com/graphql',
    {
      ...testSession,
      version: () => sessionVersion,
    },
    () => {
      markStarted();
      return new Promise((resolve) => {
        finish = resolve;
      });
    },
  );
  const rejected = expect(client.query({ query: products })).rejects.toMatchObject({
    kind: 'aborted',
  });

  await started;
  sessionVersion++;
  finish(new Response(JSON.stringify({ data: { products: [{ id: 'stale' }] } })));
  await rejected;
  expect(client.cache.extract()).toEqual({});
});
