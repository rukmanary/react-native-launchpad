import { createAuthenticatedApi } from '@/core/http/authentication';
import { config } from '@/core/config/config';

export const api = createAuthenticatedApi(config.services.apiBaseUrl);
