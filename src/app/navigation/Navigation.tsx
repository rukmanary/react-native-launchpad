import { AppTabs } from '@/app/navigation/Tabs';
import { navigationRef } from '@/app/navigation/ref';
import type { RootStackRoutes } from '@/app/navigation/routes';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BootSplash from 'react-native-bootsplash';
import { FormExampleScreen } from '@/features/authentication';
import { ProductListScreen } from '@/features/catalog';
import { config } from '@/core/config/config';
import { StarterKitScreen } from '@/app/navigation/StarterKitScreen';

const Stack = createNativeStackNavigator<RootStackRoutes>();

export function Navigation() {
  return (
    <NavigationContainer
      ref={navigationRef}
      linking={{
        prefixes: [config.scheme + '://'],
        config: {
          screens: { Main: { screens: { Home: '' } }, Form: 'form', Products: 'products' },
        },
      }}
      onReady={() => {
        void BootSplash.hide({ fade: true }).catch(() => undefined);
      }}
    >
      <Stack.Navigator>
        <Stack.Screen name="Main" component={AppTabs} options={{ title: config.displayName }} />
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
