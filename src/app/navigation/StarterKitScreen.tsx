import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AppModal,
  AppText,
  Badge,
  Button,
  Card,
  Divider,
  FormScreen,
  TextField,
} from '../../shared/ui';
import { spacing } from '../../shared/theme/theme';
import { config } from '../../core/config/config';
import { useAppLanguage } from '../store/StateProvider';

export function StarterKitScreen() {
  const { language, setLanguage } = useAppLanguage();
  const [name, setName] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  return (
    <FormScreen>
      <View style={styles.badges}>
        <Badge label={config.state} />
        <Badge label={config.api === 'graphql' ? 'GraphQL' : 'REST'} />
        <Badge label={config.flavor} />
      </View>

      <Card>
        <AppText variant="heading">Form controls</AppText>
        <Divider />
        <TextField label="Display name" value={name} onChangeText={setName} />
        <Button label="Preview" disabled={!name.trim()} onPress={() => setShowPreview(true)} />
        <Button label="Clear" variant="secondary" onPress={() => setName('')} />
      </Card>

      <Card>
        <AppText variant="heading">Language preference</AppText>
        <AppText tone="muted">
          Current language: {language === 'en' ? 'English' : 'Indonesian'}
        </AppText>
        <Button
          label={language === 'en' ? 'Use Indonesian' : 'Use English'}
          variant="secondary"
          onPress={() => setLanguage(language === 'en' ? 'id' : 'en')}
        />
      </Card>

      <AppModal open={showPreview} onClose={() => setShowPreview(false)}>
        <View style={styles.modal}>
          <AppText variant="title">{name.trim()}</AppText>
          <Button label="Close preview" variant="secondary" onPress={() => setShowPreview(false)} />
        </View>
      </AppModal>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  modal: { padding: spacing.lg, gap: spacing.md },
});
