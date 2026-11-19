import { config } from '../config/config';
import { session } from '../session/session';
import { createGraphQLClient } from './create-client';

export const graphqlClient = createGraphQLClient(config.services.graphqlUrl, session);
