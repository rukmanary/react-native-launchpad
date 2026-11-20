import { config } from '@/core/config/config';
import { session } from '@/core/session/session';
import { createGraphQLClient } from '@/core/graphql/create-client';

export const graphqlClient = createGraphQLClient(config.services.graphqlUrl, session);
