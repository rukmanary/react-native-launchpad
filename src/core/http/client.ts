export class ApiError extends Error {
  constructor(
    public readonly kind:
      'http' | 'network' | 'timeout' | 'aborted' | 'validation' | 'configuration',
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
type Schema<T> = { parse(value: unknown): T };
export type RequestOptions<T> = {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  schema: Schema<T>;
  auth?: boolean;
  headers?: Record<string, string>;
};
export type HttpDependencies = {
  baseUrl: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
  token?: () => Promise<string | null>;
  refresh?: () => Promise<void>;
  sessionVersion?: () => number;
  expire?: () => Promise<void>;
  beforeRequest?: (request: { url: string; headers: Headers }) => void;
  afterResponse?: (response: { status: number; durationMs: number }) => void;
};
export function createHttpClient(deps: HttpDependencies) {
  const base = new URL(deps.baseUrl);
  let refreshing: Promise<void> | undefined;
  async function request<T>(options: RequestOptions<T>): Promise<T> {
    const url = new URL(options.path, base);
    if (url.origin !== base.origin || base.hostname.endsWith('.invalid'))
      throw new ApiError('configuration', 'Configure a trusted API origin first');
    const generation = deps.sessionVersion?.();
    const controller = new AbortController();
    let timedOut = false;
    const abort = () => controller.abort();
    if (options.signal?.aborted) abort();
    options.signal?.addEventListener('abort', abort);
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, deps.timeoutMs ?? 15000);
    const wait = <T>(promise: Promise<T>): Promise<T> =>
      new Promise((resolve, reject) => {
        const cancelled = () => {
          cleanup();
          reject(new ApiError(timedOut ? 'timeout' : 'aborted', 'Request cancelled'));
        };
        const cleanup = () => controller.signal.removeEventListener('abort', cancelled);
        if (controller.signal.aborted) {
          cancelled();
          return;
        }
        controller.signal.addEventListener('abort', cancelled);
        promise.then(
          (value) => {
            cleanup();
            resolve(value);
          },
          (error) => {
            cleanup();
            reject(error);
          },
        );
      });
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        if (controller.signal.aborted)
          throw new ApiError(timedOut ? 'timeout' : 'aborted', 'Request cancelled');
        if (generation !== deps.sessionVersion?.())
          throw new ApiError('aborted', 'Session changed');
        const headers = new Headers(options.headers);
        headers.set('Accept', 'application/json');
        const token = options.auth === false ? null : await wait(Promise.resolve(deps.token?.()));
        if (generation !== deps.sessionVersion?.())
          throw new ApiError('aborted', 'Session changed');
        if (token) headers.set('Authorization', 'Bearer ' + token);
        const multipart = typeof FormData !== 'undefined' && options.body instanceof FormData;
        if (options.body !== undefined && !multipart)
          headers.set('Content-Type', 'application/json');
        deps.beforeRequest?.({ url: url.toString(), headers });
        const start = Date.now();
        let response: Response;
        try {
          response = await wait(
            (deps.fetcher ?? fetch)(url.toString(), {
              method: options.method ?? 'GET',
              headers,
              signal: controller.signal,
              body:
                options.body === undefined
                  ? undefined
                  : multipart
                    ? (options.body as FormData)
                    : JSON.stringify(options.body),
            }),
          );
        } catch {
          throw new ApiError(
            controller.signal.aborted ? (timedOut ? 'timeout' : 'aborted') : 'network',
            'Request failed',
          );
        }
        if (generation !== deps.sessionVersion?.())
          throw new ApiError('aborted', 'Session changed');
        deps.afterResponse?.({ status: response.status, durationMs: Date.now() - start });
        if (controller.signal.aborted)
          throw new ApiError(timedOut ? 'timeout' : 'aborted', 'Request cancelled');
        if (response.status === 401 && options.auth !== false && deps.refresh && attempt === 0) {
          const currentToken = await wait(Promise.resolve(deps.token?.()));
          if (token && currentToken && currentToken !== token) continue;
          if (!refreshing)
            refreshing = deps
              .refresh()
              .catch(async (error: unknown) => {
                if (generation === deps.sessionVersion?.()) await deps.expire?.();
                throw error;
              })
              .finally(() => {
                refreshing = undefined;
              });
          await wait(refreshing);
          continue;
        }
        if (!response.ok)
          throw new ApiError('http', 'Server rejected the request', response.status);
        let value: unknown;
        try {
          value =
            response.status === 204
              ? undefined
              : response.headers.get('content-type')?.includes('json')
                ? await wait(response.json())
                : await wait(response.text());
        } catch {
          throw new ApiError(
            controller.signal.aborted ? (timedOut ? 'timeout' : 'aborted') : 'validation',
            'Invalid response body',
          );
        }
        if (generation !== deps.sessionVersion?.())
          throw new ApiError('aborted', 'Session changed');
        try {
          return options.schema.parse(value);
        } catch {
          throw new ApiError('validation', 'Unexpected response format');
        }
      }
      throw new ApiError('http', 'Authentication failed', 401);
    } finally {
      clearTimeout(timeout);
      options.signal?.removeEventListener('abort', abort);
    }
  }
  return { request };
}
