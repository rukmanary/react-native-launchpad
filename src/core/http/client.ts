import { createRequestAuth } from '@/core/http/request-auth';
import { createRequestScope } from '@/core/http/request-scope';
import { parseResponse, readResponse } from '@/core/http/response';
import { prepareHeaders, resolveTrustedUrl, sendRequest } from '@/core/http/transport';

export { ApiError } from '@/core/http/errors';

export type RequestOptions<T> = {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  schema: { parse(value: unknown): T };
  auth?: boolean;
  headers?: Record<string, string>;
};

export type HttpDependencies = Parameters<typeof createRequestAuth>[0] & {
  baseUrl: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
  beforeRequest?: (request: { url: string; headers: Headers }) => void;
  afterResponse?: (response: { status: number; durationMs: number }) => void;
};

export function createHttpClient(deps: HttpDependencies) {
  const base = new URL(deps.baseUrl);
  const authorize = createRequestAuth(deps);

  const request = async <T>(options: RequestOptions<T>): Promise<T> => {
    const url = resolveTrustedUrl(base, options.path);
    const scope = createRequestScope(deps.timeoutMs ?? 15_000, options.signal);
    const auth = authorize(scope, options.auth !== false);

    async function attempt() {
      scope.throwIfCancelled();
      auth.ensureCurrentSession();

      const token = await auth.token();

      auth.ensureCurrentSession();

      const headers = prepareHeaders(options.headers, options.body, token);

      deps.beforeRequest?.({ url, headers });

      const started = Date.now();
      const response = await sendRequest(
        deps.fetcher ?? fetch,
        url,
        {
          method: options.method ?? 'GET',
          headers,
          body: options.body,
        },
        scope,
      );

      auth.ensureCurrentSession();
      deps.afterResponse?.({ status: response.status, durationMs: Date.now() - started });
      scope.throwIfCancelled();
      return { response, token };
    }

    try {
      const first = await attempt();
      let response = first.response;

      if (response.status === 401 && (await auth.refreshAfterUnauthorized(first.token))) {
        ({ response } = await attempt());
      }

      const payload = await readResponse(response, scope);

      scope.throwIfCancelled();
      auth.ensureCurrentSession();
      return parseResponse(payload, options.schema);
    } finally {
      scope.dispose();
    }
  };

  return { request };
}
