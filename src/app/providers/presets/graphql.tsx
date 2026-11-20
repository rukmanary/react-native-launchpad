import { type PropsWithChildren } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { graphqlClient } from '@/core/graphql/client';

export function ApiProvider({ children }: PropsWithChildren) {
  return <ApolloProvider client={graphqlClient}>{children}</ApolloProvider>;
}

export async function clearApiCache() {
  await graphqlClient.clearStore();
}
