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
