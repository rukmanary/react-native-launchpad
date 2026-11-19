import { createAuthenticatedApi } from './authentication';
import { config } from '../config/config';
export const api = createAuthenticatedApi(config.services.apiBaseUrl);
