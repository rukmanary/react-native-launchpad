import { z } from 'zod';
import { createHttpClient } from '../../src/core/http/client';

const response = (status: number, value: unknown) =>
  ({
    status,
    ok: status >= 200 && status < 300,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => value,
    text: async () => String(value),
  }) as Response;
const schema = z.object({ ok: z.boolean() });

test('rejects cross-origin URLs before attaching credentials', async () => {
  const fetcher = jest.fn();
  const client = createHttpClient({ baseUrl: 'https://api.example.com', fetcher });

  await expect(client.request({ path: 'https://other.example.com', schema })).rejects.toMatchObject(
    { kind: 'configuration' },
  );
  expect(fetcher).not.toHaveBeenCalled();
});

test('validates the runtime response', async () => {
  const client = createHttpClient({
    baseUrl: 'https://api.example.com',
    fetcher: jest.fn().mockResolvedValue(response(200, { ok: 'wrong' })),
  });

  await expect(client.request({ path: '/data', schema })).rejects.toMatchObject({
    kind: 'validation',
  });
});

test('HTTP errors do not become successful empty values', async () => {
  const client = createHttpClient({
    baseUrl: 'https://api.example.com',
    fetcher: jest.fn().mockResolvedValue(response(503, { secret: 'must not appear in error' })),
  });

  await expect(client.request({ path: '/data', schema })).rejects.toMatchObject({
    kind: 'http',
    status: 503,
    message: 'Server rejected the request',
  });
});

test('empty 204 responses are supported', async () => {
  const client = createHttpClient({
    baseUrl: 'https://api.example.com',
    fetcher: jest.fn().mockResolvedValue(response(204, undefined)),
  });

  await expect(client.request({ path: '/data', schema: z.undefined() })).resolves.toBeUndefined();
});

test('concurrent 401 requests share one refresh', async () => {
  let token = 'old';
  let complete!: () => void;
  const refresh = jest.fn(
    () =>
      new Promise<void>((resolve) => {
        complete = () => {
          token = 'new';
          resolve();
        };
      }),
  );
  const fetcher: typeof fetch = jest.fn(async (_url, options) =>
    response(new Headers(options?.headers).get('Authorization') === 'Bearer new' ? 200 : 401, {
      ok: true,
    }),
  );
  const client = createHttpClient({
    baseUrl: 'https://api.example.com',
    fetcher,
    token: async () => token,
    refresh,
  });
  const first = client.request({ path: '/data', schema });
  const second = client.request({ path: '/data', schema });

  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  expect(refresh).toHaveBeenCalledTimes(1);
  complete();
  await expect(Promise.all([first, second])).resolves.toEqual([{ ok: true }, { ok: true }]);
});

test('logout during refresh cannot revive the request', async () => {
  let generation = 1;
  let complete!: () => void;
  const client = createHttpClient({
    baseUrl: 'https://api.example.com',
    fetcher: jest.fn().mockResolvedValue(response(401, {})),
    sessionVersion: () => generation,
    refresh: () =>
      new Promise((resolve) => {
        complete = resolve;
      }),
  });
  const pending = client.request({ path: '/data', schema });

  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  generation++;
  complete();
  await expect(pending).rejects.toMatchObject({ kind: 'aborted' });
});

test('aborted requests never reach the transport', async () => {
  const controller = new AbortController();

  controller.abort();

  const fetcher = jest.fn();
  const client = createHttpClient({ baseUrl: 'https://api.example.com', fetcher });

  await expect(
    client.request({ path: '/data', schema, signal: controller.signal }),
  ).rejects.toMatchObject({ kind: 'aborted' });
  expect(fetcher).not.toHaveBeenCalled();
});

test('POST requests do not retry transient errors', async () => {
  const fetcher = jest.fn().mockResolvedValue(response(503, {}));
  const client = createHttpClient({ baseUrl: 'https://api.example.com', fetcher });

  await expect(
    client.request({ path: '/pay', method: 'POST', body: { amount: 1 }, schema }),
  ).rejects.toMatchObject({ status: 503 });
  expect(fetcher).toHaveBeenCalledTimes(1);
});

test('timeout also cancels waiting for a shared refresh', async () => {
  jest.useFakeTimers();

  const client = createHttpClient({
    baseUrl: 'https://api.example.com',
    timeoutMs: 50,
    fetcher: jest.fn().mockResolvedValue(response(401, {})),
    refresh: () => new Promise(() => { }),
  });
  const pending = client.request({ path: '/data', schema });
  const rejected = expect(pending).rejects.toMatchObject({ kind: 'timeout' });

  await jest.advanceTimersByTimeAsync(51);
  await rejected;
  jest.useRealTimers();
});

test('timeout includes reading a response body that never completes', async () => {
  jest.useFakeTimers();
  try {
    const slowResponse = response(200, {});

    slowResponse.json = () => new Promise(() => { });

    const client = createHttpClient({
      baseUrl: 'https://api.example.com',
      timeoutMs: 50,
      fetcher: jest.fn().mockResolvedValue(slowResponse),
    });
    const rejected = expect(client.request({ path: '/data', schema })).rejects.toMatchObject({
      kind: 'timeout',
    });

    await jest.advanceTimersByTimeAsync(51);
    await rejected;
  } finally {
    jest.useRealTimers();
  }
});
