import raw from '@/starter.config.json';
import { resolveAppConfig } from '@/core/config/config';

const settings = {
  ...raw,
  androidId: 'com.example.mobile',
  iosId: 'com.example.other',
  scheme: 'example-app',
  displayName: 'Example',
  services: { ...raw.services, apiBaseUrl: 'https://production.example.com', firebase: true },
  flavorServices: { dev: { apiBaseUrl: 'https://dev.example.com' }, qa: {} },
};

test('selects services and identity from the installed native application ID', () => {
  const production = resolveAppConfig(settings, 'com.example.mobile', 'android');

  expect(production).toMatchObject({
    flavor: 'production',
    scheme: 'example-app',
    displayName: 'Example',
    services: { apiBaseUrl: 'https://production.example.com', firebase: true },
  });

  const dev = resolveAppConfig(settings, 'com.example.mobile.dev', 'android');

  expect(dev).toMatchObject({
    flavor: 'dev',
    scheme: 'example-app.dev',
    displayName: 'Example Dev',
    services: { apiBaseUrl: 'https://dev.example.com', firebase: false },
  });

  const qa = resolveAppConfig(settings, 'com.example.other.qa', 'ios');

  expect(qa).toMatchObject({
    flavor: 'qa',
    scheme: 'example-app.qa',
    displayName: 'Example QA',
    services: { apiBaseUrl: 'https://example.invalid', firebase: false },
  });
  expect(() => resolveAppConfig(settings, 'com.example.mobile.qa', 'ios')).toThrow(
    'Native application ID does not match',
  );
});
