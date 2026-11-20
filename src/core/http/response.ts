import { ApiError } from '@/core/http/errors';
import type { RequestScope } from '@/core/http/request-scope';

export async function readResponse(response: Response, scope: RequestScope): Promise<unknown> {
  if (!response.ok) throw new ApiError('http', 'Server rejected the request', response.status);
  if (response.status === 204) return undefined;

  try {
    const isJson = response.headers.get('content-type')?.includes('json');
    return await scope.wait(() => (isJson ? response.json() : response.text()));
  } catch {
    scope.throwIfCancelled();
    throw new ApiError('validation', 'Invalid response body');
  }
}

export function parseResponse<T>(value: unknown, schema: { parse(value: unknown): T }): T {
  try {
    return schema.parse(value);
  } catch {
    throw new ApiError('validation', 'Unexpected response format');
  }
}
