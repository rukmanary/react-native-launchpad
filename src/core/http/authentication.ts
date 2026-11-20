import { z } from 'zod';
import { createHttpClient } from './client';
import { session } from '../session/session';

const tokens = z.object({ accessToken: z.string().min(1), refreshToken: z.string().min(1) });

export function createAuthenticatedApi(
  baseUrl: string,
  paths = { login: '/auth/login', refresh: '/auth/refresh' },
) {
  const publicClient = createHttpClient({ baseUrl, sessionVersion: session.version });
  const client = createHttpClient({
    baseUrl,
    sessionVersion: session.version,
    token: async () => (await session.read())?.accessToken ?? null,
    expire: session.clear,
    refresh: async () => {
      const generation = session.version();
      const current = await session.read();

      if (!current) throw new Error('No active session');

      const next = await publicClient.request({
        path: paths.refresh,
        method: 'POST',
        body: { refreshToken: current.refreshToken },
        auth: false,
        schema: tokens,
      });

      await session.replace(next, generation);
    },
  });

  return {
    ...client,
    async login(credentials: { email: string; password: string }) {
      const next = await publicClient.request({
        path: paths.login,
        method: 'POST',
        body: credentials,
        auth: false,
        schema: tokens,
      });
      await session.start(next);
    },
  };
}
