import { AppTabs } from '@/app/navigation/Tabs';
import { navigationRef } from '@/app/navigation/ref';
import type { RootStackRoutes } from '@/app/navigation/routes';
import { useMemo } from 'react';
import {
  DarkTheme,
  DefaultTheme,
  getFocusedRouteNameFromRoute,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BootSplash from 'react-native-bootsplash';
import { FormExampleScreen } from '@/features/authentication';
import { ProductListScreen } from '@/features/catalog';
import { config } from '@/core/config/config';
import { StarterKitScreen } from '@/app/navigation/StarterKitScreen';
import { useTheme } from '@/shared/theme/theme';
import { ScreenInsetsProvider } from '@/shared/ui/Screen';

const Stack = createNativeStackNavigator<RootStackRoutes>();

export const Navigation = () => {
  const { colors, mode } = useTheme();
  const navTheme = useMemo(() => {
    const base = mode === 'dark' ? DarkTheme : DefaultTheme;

    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.danger,
      },
    };
  }, [colors, mode]);

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navTheme}
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
      <Stack.Navigator
        screenOptions={{ statusBarStyle: mode === 'dark' ? 'light' : 'dark' }}
        screenLayout={({ children }) => (
          <ScreenInsetsProvider topHandled>{children}</ScreenInsetsProvider>
        )}
      >
        <Stack.Screen
          name="Main"
          component={AppTabs}
          options={({ route }) => ({
            title: config.displayName,
            headerShown: getFocusedRouteNameFromRoute(route) !== 'Component',
          })}
        />
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
};
