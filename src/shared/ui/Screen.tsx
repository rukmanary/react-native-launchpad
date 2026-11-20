import type { PropsWithChildren } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { colors } from '@/shared/theme/theme';

type Props = PropsWithChildren<{ topInset?: boolean; bottomInset?: boolean; style?: ViewStyle }>;

export function Screen({ children, topInset = false, bottomInset = true, style }: Props) {
  const inset = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: topInset ? inset.top : 0,
          paddingBottom: bottomInset ? inset.bottom : 0,
          paddingLeft: inset.left,
          paddingRight: inset.right,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function FormScreen({ children }: PropsWithChildren) {
  const inset = useSafeAreaInsets();

  return (
    <KeyboardAwareScrollView
      bottomOffset={16}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: inset.bottom + 24,
          paddingLeft: inset.left + 24,
          paddingRight: inset.right + 24,
        },
      ]}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}

export function ScreenFooter({ children }: PropsWithChildren) {
  const inset = useSafeAreaInsets();

  return (
    <KeyboardStickyView offset={{ closed: 0, opened: inset.bottom }}>
      <View
        style={{
          padding: 16,
          paddingBottom: inset.bottom + 16,
          paddingLeft: inset.left + 16,
          paddingRight: inset.right + 16,
          backgroundColor: colors.surface,
        }}
      >
        {children}
      </View>
    </KeyboardStickyView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, gap: 16, flexGrow: 1 },
});
