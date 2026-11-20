import { AppTabs } from './Tabs';
import { navigationRef } from './ref';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import BootSplash from 'react-native-bootsplash';
import { Screen } from '../../shared/ui/Screen';
import { Button } from '../../shared/ui/Button';
import { FormExampleScreen } from '../../features/authentication';
import { ProductListScreen } from '../../features/catalog';
import { config } from '../../core/config/config';
import { colors } from '../../shared/theme/theme';
import { StarterKitScreen } from './StarterKitScreen';

type Routes = { Home: undefined; Form: undefined; Products: undefined; StarterKit: undefined };

const Stack = createNativeStackNavigator<Routes>();

function Home({ navigation }: NativeStackScreenProps<Routes, 'Home'>) {
  const { t } = useTranslation();

  return (
    <Screen bottomInset={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title} testID="home-title">
          {t('welcome')}
        </Text>
        <Text style={styles.description}>{t('description')}</Text>
        <Button label={t('form')} onPress={() => navigation.navigate('Form')} />
        <Button label={t('catalog')} onPress={() => navigation.navigate('Products')} />
        <Button
          label="UI starter kit"
          variant="secondary"
          onPress={() => navigation.navigate('StarterKit')}
        />
        <Text>Active modules: {config.modules.join(', ')}</Text>
        <Text>
          Configure the API URL before opening the API example. Native modules are selected with
          pnpm modules.
        </Text>
      </ScrollView>
    </Screen>
  );
}

export function Navigation() {
  return (
    <NavigationContainer
      ref={navigationRef}
      linking={{
        prefixes: [config.scheme + '://'],
        config: { screens: { Home: '', Form: 'form', Products: 'products' } },
      }}
      onReady={() => {
        void BootSplash.hide({ fade: true }).catch(() => undefined);
      }}
    >
      <Stack.Navigator>
        <Stack.Screen name="Home" options={{ title: config.displayName }}>
          {(props) => (
            <AppTabs>
              <Home {...props} />
            </AppTabs>
          )}
        </Stack.Screen>
        <Stack.Screen
          name="Form"
          component={FormExampleScreen}
          options={{ title: 'Form example' }}
        />
        <Stack.Screen name="Products" component={ProductListScreen} />
        <Stack.Screen
          name="StarterKit"
          component={StarterKitScreen}
          options={{ title: 'UI starter kit' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, gap: 20 },
  title: { fontSize: 32, fontWeight: '700', color: colors.text },
  description: { fontSize: 17, color: colors.muted },
});
