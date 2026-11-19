import { session } from '../../core/session/session';
import { queryClient } from '../providers/query';
export async function logout() {
  const clearing = session.clear();
  await queryClient.cancelQueries();
  queryClient.clear();
  await clearing;
}
