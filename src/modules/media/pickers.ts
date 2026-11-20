import {
  launchImageLibrary,
  launchCamera,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import {
  pick,
  types,
  isErrorWithCode,
  errorCodes,
  keepLocalCopy,
} from '@react-native-documents/picker';
import ImageCropPicker from 'react-native-image-crop-picker';
import { ensurePermission } from '../../core/permissions/permissions';

function result(response: ImagePickerResponse) {
  if (response.didCancel) return null;
  if (response.errorCode) throw new Error(response.errorMessage ?? response.errorCode);

  const asset = response.assets?.[0];

  if (!asset?.uri) throw new Error('Picker returned no file');
  if ((asset.fileSize ?? 0) > 10 * 1024 * 1024)
    throw new Error('Image exceeds the 10 MB upload limit');
  return asset;
}

export async function chooseImage() {
  return result(
    await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 0.8,
      includeBase64: false,
    }),
  );
}

export async function takeImage() {
  if (!(await ensurePermission('camera')).granted) throw new Error('Camera permission denied');
  return result(
    await launchCamera({
      mediaType: 'photo',
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 0.8,
      saveToPhotos: false,
    }),
  );
}

export async function chooseDocument() {
  try {
    const [file] = await pick({ type: [types.allFiles], allowMultiSelection: false });
    return file ?? null;
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) return null;
    throw error;
  }
}

export async function cacheDocument(uri: string, fileName: string) {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const [result] = await keepLocalCopy({
    destination: 'cachesDirectory',
    files: [{ uri, fileName: safe }],
  });

  if (!result || result.status !== 'success') throw new Error('Could not copy selected document');
  return result.localUri;
}

export async function cropImage(path: string) {
  try {
    return await ImageCropPicker.openCropper({
      path,
      mediaType: 'photo',
      width: 1200,
      height: 1200,
      compressImageQuality: 0.82,
      includeBase64: false,
    });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'E_PICKER_CANCELLED'
    )
      return null;
    throw error;
  }
}

export const clearCropCache = () => ImageCropPicker.clean();
