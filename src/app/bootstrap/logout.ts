import { session } from '@/core/session/session';
import { clearApiCache } from '@/app/providers/ApiProvider';

export async function logout() {
  await Promise.all([session.clear(), clearApiCache()]);
}
