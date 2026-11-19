import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import DeviceInfo from 'react-native-device-info';
export function cachePath(name: string) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(name) || name.includes('..'))
    throw new Error('Invalid cache filename');
  return RNFS.CachesDirectoryPath + '/' + name;
}
export async function downloadToCache(url: string, name: string, signal?: AbortSignal) {
  if (new URL(url).protocol !== 'https:') throw new Error('HTTPS required');
  if (signal?.aborted) throw new Error('Download cancelled');
  const destination = cachePath(name);
  const job = RNFS.downloadFile({ fromUrl: url, toFile: destination });
  const cancel = () => RNFS.stopDownload(job.jobId);
  signal?.addEventListener('abort', cancel);
  try {
    const result = await job.promise;
    if (signal?.aborted || result.statusCode < 200 || result.statusCode >= 300)
      throw new Error('Download failed');
    return destination;
  } catch (error) {
    if (await RNFS.exists(destination)) await RNFS.unlink(destination);
    throw error;
  } finally {
    signal?.removeEventListener('abort', cancel);
  }
}
export async function removeCachedFile(name: string) {
  const file = cachePath(name);
  if (await RNFS.exists(file)) await RNFS.unlink(file);
}
export const shareFile = (uri: string, type: string) =>
  Share.open({ url: uri, type, failOnCancel: false });
export const getDeviceSummary = () => ({
  model: DeviceInfo.getModel(),
  system: DeviceInfo.getSystemName(),
  systemVersion: DeviceInfo.getSystemVersion(),
  appVersion: DeviceInfo.getVersion(),
  build: DeviceInfo.getBuildNumber(),
});
