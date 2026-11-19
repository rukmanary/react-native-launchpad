import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { config } from '../../core/config/config';
export function configureGoogleSignIn() {
  if (!config.services.googleWebClientId) throw new Error('Configure Google web client ID');
  GoogleSignin.configure({
    webClientId: config.services.googleWebClientId,
    iosClientId: config.services.googleIosClientId || undefined,
  });
}
export async function signInWithGoogle() {
  configureGoogleSignIn();
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    return isSuccessResponse(response) ? response.data : null;
  } catch (error) {
    if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) return null;
    throw error;
  }
}
export const signOutGoogle = () => GoogleSignin.signOut();
