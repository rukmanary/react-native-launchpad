import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/shared/ui/AppText';
import { Button } from '@/shared/ui/Button';
import { Screen } from '@/shared/ui/Screen';
import { useTheme } from '@/shared/theme/theme';

type Props = {
  onOpenForm: () => void;
  onOpenCatalog: () => void;
  onOpenStarterKit: () => void;
};

export const HomeScreen = ({ onOpenForm, onOpenCatalog, onOpenStarterKit }: Props) => {
  const { t } = useTranslation();
  const { spacing } = useTheme();

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <AppText variant="title" testID="home-title">
          {t('welcome')}
        </AppText>
        <AppText tone="muted">{t('description')}</AppText>
        <Button label={t('form')} onPress={onOpenForm} />
        <Button label={t('catalog')} onPress={onOpenCatalog} />
        <Button label="UI starter kit" variant="secondary" onPress={onOpenStarterKit} />
      </ScrollView>
    </Screen>
  );
};
