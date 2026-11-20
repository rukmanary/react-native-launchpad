import { ApiError } from '@/core/http/errors';
import type { RequestScope } from '@/core/http/request-scope';

type AuthDependencies = {
  token?: () => Promise<string | null>;
  refresh?: () => Promise<void>;
  sessionVersion?: () => number;
  expire?: () => Promise<void>;
};

export function createRequestAuth(deps: AuthDependencies) {
  const refreshes = new Map<number | undefined, Promise<void>>();

  return function forRequest(scope: RequestScope, requiresAuth: boolean) {
    const version = deps.sessionVersion?.();

    const ensureCurrentSession = () => {
      if (version !== deps.sessionVersion?.()) throw new ApiError('aborted', 'Session changed');
    };

    const token = async () => {
      if (!requiresAuth) return null;

      const value = await scope.wait(() => deps.token?.() ?? null);

      ensureCurrentSession();
      return value;
    };

    const refreshAfterUnauthorized = async (previousToken: string | null) => {
      const refresh = deps.refresh;
      if (!requiresAuth || !refresh) return false;

      const currentToken = await token();
      if (previousToken && currentToken && previousToken !== currentToken) return true;

      let pending = refreshes.get(version);

      if (!pending) {
        // Requests from the same session share a refresh, even if one caller cancels.
        pending = Promise.resolve()
          .then(() => {
            ensureCurrentSession();
            return refresh();
          })
          .catch(async (error: unknown) => {
            if (version === deps.sessionVersion?.()) await deps.expire?.();
            throw error;
          })
          .finally(() => refreshes.delete(version));
        refreshes.set(version, pending);
      }

      await scope.wait(() => pending);
      ensureCurrentSession();
      return true;
    };

    return { token, ensureCurrentSession, refreshAfterUnauthorized };
  };
}
