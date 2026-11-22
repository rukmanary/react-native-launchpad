import { StyleSheet } from 'react-native';
import { AppText } from '@/shared/ui/AppText';
import { Screen } from '@/shared/ui/Screen';
import { useTheme } from '@/shared/theme/theme';

type Props = { title: string; testID: string };

export const TabPlaceholder = ({ title, testID }: Props) => {
  const { spacing } = useTheme();

  return (
    <Screen style={[styles.content, { padding: spacing.lg, gap: spacing.sm }]}>
      <AppText variant="title" testID={testID}>
        {title}
      </AppText>
      <AppText tone="muted">Coming soon</AppText>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { alignItems: 'flex-start' },
});
