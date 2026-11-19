import ReactNativeBiometrics from 'react-native-biometrics';
const biometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });
export async function checkBiometrics() {
  return biometrics.isSensorAvailable();
}
export async function unlockWithBiometrics(prompt = 'Unlock') {
  const result = await biometrics.simplePrompt({ promptMessage: prompt });
  return result.success;
}
export async function createSigningKey() {
  const { available } = await biometrics.isSensorAvailable();
  if (!available) throw new Error('Biometrics unavailable');
  return biometrics.createKeys();
}
export async function signServerChallenge(challenge: string) {
  if (!challenge.trim()) throw new Error('Server challenge required');
  const result = await biometrics.createSignature({
    promptMessage: 'Approve sign in',
    payload: challenge,
  });
  if (!result.success || !result.signature) throw new Error('Signing cancelled');
  return result.signature;
}
export const deleteSigningKey = () => biometrics.deleteKeys();
