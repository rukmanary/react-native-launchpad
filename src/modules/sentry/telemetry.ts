import * as Sentry from '@sentry/react-native';
import { config } from '../../core/config/config';

const secret = /authorization|cookie|password|token|secret|email|phone/i;

export function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        secret.test(key) ? '[redacted]' : redact(item),
      ]),
    );
  return value;
}

export function initializeTelemetry() {
  if (!config.services.sentryDsn) return;
  Sentry.init({
    dsn: config.services.sentryDsn,
    enabled: !__DEV__,
    sendDefaultPii: false,
    tracesSampleRate: 0.1,
    beforeSend: (event) => {
      if (event.request) {
        delete event.request.cookies;
        delete event.request.data;
        delete event.request.headers;
        delete event.request.query_string;
      }
      event.user = undefined;
      event.extra = redact(event.extra) as Record<string, unknown>;
      return event;
    },
    beforeBreadcrumb: (breadcrumb) => ({
      ...breadcrumb,
      data: redact(breadcrumb.data) as Record<string, unknown>,
    }),
  });
}

export const captureFailure = (error: unknown) => Sentry.captureException(error);

export const TracedApp = Sentry.wrap;
