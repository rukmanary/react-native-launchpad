jest.mock('react-native-keychain', () => ({
  ACCESSIBLE: { WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'device' },
  getGenericPassword: jest.fn(),
  setGenericPassword: jest.fn().mockResolvedValue(true),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
}));
import * as Keychain from 'react-native-keychain';
import { session } from '../../src/core/session/session';

beforeEach(() => jest.clearAllMocks());

test('a stale refresh cannot overwrite credentials after logout', async () => {
  const generation = session.version();

  await session.clear();
  await session.replace({ accessToken: 'test-access', refreshToken: 'test-refresh' }, generation); // pii-allow
  expect(Keychain.setGenericPassword).not.toHaveBeenCalled();
});

test('invalid persisted credentials are discarded', async () => {
  jest.mocked(Keychain.getGenericPassword).mockResolvedValue({
    service: 'test',
    storage: 'keychain',
    username: 'session',
    password: 'invalid',
  });
  await expect(session.read()).resolves.toBeNull();
  expect(Keychain.resetGenericPassword).toHaveBeenCalledTimes(1);
});

test('discarding an old corrupt read cannot erase a newer login', async () => {
  let finishRead!: (value: Awaited<ReturnType<typeof Keychain.getGenericPassword>>) => void;
  jest.mocked(Keychain.getGenericPassword).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finishRead = resolve;
      }),
  );
  const reading = session.read();

  await Promise.resolve();

  const starting = session.start({ accessToken: 'new-access', refreshToken: 'new-refresh' }); // pii-allow

  finishRead({ service: 'test', storage: 'keychain', username: 'session', password: 'invalid' });
  await Promise.all([reading, starting]);

  const resetOrder = jest.mocked(Keychain.resetGenericPassword).mock.invocationCallOrder[0]!;
  const writeOrder = jest.mocked(Keychain.setGenericPassword).mock.invocationCallOrder[0]!;

  expect(resetOrder).toBeLessThan(writeOrder);
});
