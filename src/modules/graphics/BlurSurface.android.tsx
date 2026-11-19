import type { PropsWithChildren } from 'react';
import { requireNativeComponent, type ViewProps } from 'react-native';
const NativeTarget = requireNativeComponent<ViewProps & { targetKey: string }>('StarterBlurTarget');
const NativeBlur = requireNativeComponent<ViewProps & { targetKey: string; radius?: number }>(
  'StarterBlurSurface',
);
export function BlurTarget(props: PropsWithChildren<ViewProps & { targetKey: string }>) {
  return <NativeTarget {...props} />;
}
export function BlurSurface(
  props: PropsWithChildren<ViewProps & { targetKey: string; radius?: number }>,
) {
  return <NativeBlur {...props} />;
}
