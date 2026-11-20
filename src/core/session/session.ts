import * as Keychain from 'react-native-keychain';
import { z } from 'zod';
import { config } from '@/core/config/config';

const tokensSchema = z.object({ accessToken: z.string().min(1), refreshToken: z.string().min(1) });

export type Tokens = z.infer<typeof tokensSchema>;

const service = config.slug + '.session';
let generation = 0;
let queue: Promise<unknown> = Promise.resolve();
const serial = <T>(action: () => Promise<T>): Promise<T> => {
  const next = queue.then(action, action);
  queue = next.catch(() => undefined);
  return next;
};

export const session = {
  version: () => generation,
  read: async (): Promise<Tokens | null> => {
    return serial(async () => {
      const credentials = await Keychain.getGenericPassword({ service });
      if (!credentials) return null;
      try {
        return tokensSchema.parse(JSON.parse(credentials.password));
      } catch {
        await Keychain.resetGenericPassword({ service });
        return null;
      }
    });
  },
  start: async (tokens: Tokens) => {
    const valid = tokensSchema.parse(tokens);
    generation++;
    await serial(() =>
      Keychain.setGenericPassword('session', JSON.stringify(valid), {
        service,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      }),
    );
  },
  replace: async (tokens: Tokens, expected: number) => {
    const valid = tokensSchema.parse(tokens);
    await serial(async () => {
      if (expected !== generation) return;
      await Keychain.setGenericPassword('session', JSON.stringify(valid), {
        service,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    });
  },
  clear: async () => {
    generation++;
    await serial(() => Keychain.resetGenericPassword({ service }));
  },
};
