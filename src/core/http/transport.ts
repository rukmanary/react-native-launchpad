import { ApiError } from '@/core/http/errors';
import type { RequestScope } from '@/core/http/request-scope';

export function resolveTrustedUrl(base: URL, path: string): string {
  const url = new URL(path, base);
  if (url.origin !== base.origin || base.hostname.endsWith('.invalid')) {
    throw new ApiError('configuration', 'Configure a trusted API origin first');
  }
  return url.toString();
}

export function prepareHeaders(
  input: Record<string, string> | undefined,
  body: unknown,
  token: string | null,
) {
  const headers = new Headers(input);
  headers.set('Accept', 'application/json');
  if (token) headers.set('Authorization', 'Bearer ' + token);
  if (body !== undefined && !isMultipart(body)) headers.set('Content-Type', 'application/json');
  return headers;
}

function isMultipart(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

export async function sendRequest(
  fetcher: typeof fetch,
  url: string,
  request: { method: string; headers: Headers; body: unknown },
  scope: RequestScope,
) {
  try {
    return await scope.wait(() =>
      fetcher(url, {
        method: request.method,
        headers: request.headers,
        body: isMultipart(request.body) ? request.body : JSON.stringify(request.body),
        signal: scope.signal,
      }),
    );
  } catch {
    scope.throwIfCancelled();
    throw new ApiError('network', 'Request failed');
  }
}
