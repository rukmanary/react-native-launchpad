import { config } from '@/core/config/config';
export function initializeModules() {
  if (config.services.firebase) {
    require('@/modules/firebase/background').registerBackgroundMessaging();
  }
  if (config.services.sentryDsn) {
    require('@/modules/sentry/telemetry').initializeTelemetry();
  }
}
