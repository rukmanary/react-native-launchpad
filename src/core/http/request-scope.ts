import { ApiError } from './errors';

export function createRequestScope(timeoutMs: number, parentSignal?: AbortSignal) {
  const controller = new AbortController();
  const { signal } = controller;
  let timedOut = false;

  const abort = () => controller.abort();
  parentSignal?.addEventListener('abort', abort);
  if (parentSignal?.aborted) abort();

  const timer = setTimeout(() => {
    timedOut = true;
    abort();
  }, timeoutMs);

  const cancellation = () => new ApiError(timedOut ? 'timeout' : 'aborted', 'Request cancelled');

  function throwIfCancelled() {
    if (signal.aborted) throw cancellation();
  }

  // Race each asynchronous stage against both the caller's signal and the request deadline.
  function wait<T>(work: () => T | Promise<T>): Promise<T> {
    throwIfCancelled();
    return new Promise((resolve, reject) => {
      const onAbort = () => reject(cancellation());
      signal.addEventListener('abort', onAbort, { once: true });
      Promise.resolve()
        .then(() => {
          throwIfCancelled();
          return work();
        })
        .then(resolve, reject)
        .finally(() => signal.removeEventListener('abort', onAbort));
    });
  }

  function dispose() {
    clearTimeout(timer);
    parentSignal?.removeEventListener('abort', abort);
  }

  return { signal, wait, throwIfCancelled, dispose };
}

export type RequestScope = ReturnType<typeof createRequestScope>;
