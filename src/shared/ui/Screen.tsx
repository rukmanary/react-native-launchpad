import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useTheme } from '@/shared/theme/theme';

type Props = PropsWithChildren<{
  topInset?: boolean;
  bottomInset?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

const ScreenInsetsContext = createContext({ topHandled: false, bottomHandled: false });

export const ScreenInsetsProvider = ({
  children,
  topHandled,
  bottomHandled,
}: PropsWithChildren<{ topHandled?: boolean; bottomHandled?: boolean }>) => {
  const inherited = useContext(ScreenInsetsContext);
  const top = topHandled ?? inherited.topHandled;
  const bottom = bottomHandled ?? inherited.bottomHandled;
  const value = useMemo(() => ({ topHandled: top, bottomHandled: bottom }), [top, bottom]);

  return <ScreenInsetsContext.Provider value={value}>{children}</ScreenInsetsContext.Provider>;
};

export const useScreenInsets = (topInset?: boolean, bottomInset?: boolean) => {
  const insets = useSafeAreaInsets();
  const { topHandled, bottomHandled } = useContext(ScreenInsetsContext);

  return {
    top: (topInset ?? !topHandled) ? insets.top : 0,
    bottom: (bottomInset ?? !bottomHandled) ? insets.bottom : 0,
    left: insets.left,
    right: insets.right,
  };
};

export const Screen = ({ children, topInset, bottomInset, style }: Props) => {
  const inset = useScreenInsets(topInset, bottomInset);
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: inset.top,
          paddingBottom: inset.bottom,
          paddingLeft: inset.left,
          paddingRight: inset.right,
        },
      ]}
    >
      <View style={[styles.root, style]}>{children}</View>
    </View>
  );
};

export const FormScreen = ({ children }: PropsWithChildren) => {
  const inset = useScreenInsets();
  const { colors, spacing } = useTheme();

  return (
    <KeyboardAwareScrollView
      bottomOffset={spacing.md}
      style={{ backgroundColor: colors.background }}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.content,
        {
          gap: spacing.md,
          paddingTop: inset.top + spacing.lg,
          paddingBottom: inset.bottom + spacing.lg,
          paddingLeft: inset.left + spacing.lg,
          paddingRight: inset.right + spacing.lg,
        },
      ]}
    >
      {children}
    </KeyboardAwareScrollView>
  );
};

export const ScreenFooter = ({ children }: PropsWithChildren) => {
  const inset = useScreenInsets();
  const { colors, spacing } = useTheme();

  return (
    <KeyboardStickyView offset={{ closed: 0, opened: inset.bottom }}>
      <View
        style={{
          padding: spacing.md,
          paddingBottom: inset.bottom + spacing.md,
          paddingLeft: inset.left + spacing.md,
          paddingRight: inset.right + spacing.md,
          backgroundColor: colors.surface,
        }}
      >
        {children}
      </View>
    </KeyboardStickyView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1 },
});
