import { z } from 'zod';
import { Platform } from 'react-native';
import { getBundleId } from 'react-native-device-info';
import raw from '../../../starter.config.json';
import flavors from '../../../config/flavors.json';

const services = z.object({
  apiBaseUrl: z.url().default('https://example.invalid'),
  graphqlUrl: z.url().default('https://example.invalid/graphql'),
  firebase: z.boolean().default(false),
  sentryDsn: z.string().default(''),
  googleWebClientId: z.string().default(''),
  googleIosClientId: z.string().default(''),
  mapsAndroidKey: z.string().default(''),
  mapsIosKey: z.string().default(''),
});

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  displayName: z.string().min(1),
  androidId: z.string().min(1),
  iosId: z.string().min(1),
  scheme: z.string().min(1),
  modules: z.array(z.string()),
  state: z.enum(['redux', 'zustand', 'mobx', 'recoil']),
  api: z.enum(['rest', 'graphql']).default('rest'),
  services,
  flavorServices: z.object({ dev: services, qa: services }),
});

export function resolveAppConfig(input: unknown, applicationId: string, platform: string) {
  const base = schema.parse(input);
  const baseId = platform === 'ios' ? base.iosId : base.androidId;
  const flavor = (Object.keys(flavors) as (keyof typeof flavors)[]).find(
    (key) => baseId + flavors[key].suffix === applicationId,
  );

  if (!flavor) throw new Error('Native application ID does not match starter.config.json');
  return {
    ...base,
    flavor,
    displayName: base.displayName + flavors[flavor].label,
    scheme: base.scheme + flavors[flavor].suffix,
    services: flavor === 'production' ? base.services : base.flavorServices[flavor],
  };
}

export const config = resolveAppConfig(raw, getBundleId(), Platform.OS);

export const hasModule = (name: string) => config.modules.includes(name);
