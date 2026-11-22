import { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ComponentShowcaseScreen,
  coreShowcaseEntries,
  coreShowcaseScreens,
  optionalShowcaseEntries,
  type ShowcaseId,
} from '@/features/component-showcase';
import { optionalShowcaseScreens } from '@/generated/showcase';
import {
  darkTheme,
  lightTheme,
  ThemeProvider,
  useTheme,
  type AppTheme,
} from '@/shared/theme/theme';
import { ScreenInsetsProvider } from '@/shared/ui/Screen';

type Routes = { Catalog: undefined } & Record<ShowcaseId, undefined>;

const Stack = createNativeStackNavigator<Routes>();

const entries = [
  ...coreShowcaseEntries.map((entry) => ({
    ...entry,
    getComponent: coreShowcaseScreens[entry.id],
  })),
  ...optionalShowcaseEntries.map((entry) => ({
    ...entry,
    getComponent: optionalShowcaseScreens[entry.id],
  })),
].map((entry) => ({
  ...entry,
  available: Boolean(entry.getComponent),
}));

export const ComponentShowcaseNavigator = () => {
  const appTheme = useTheme();
  const [preview, setPreview] = useState<AppTheme>();
  const theme = preview ?? appTheme;
  const alternate = appTheme.mode === 'light' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
          contentStyle: { backgroundColor: theme.colors.background },
          statusBarStyle: theme.mode === 'dark' ? 'light' : 'dark',
        }}
        screenLayout={({ children }) => (
          <ScreenInsetsProvider topHandled>{children}</ScreenInsetsProvider>
        )}
      >
        <Stack.Screen name="Catalog" options={{ title: 'Components', headerBackVisible: false }}>
          {({ navigation }) => (
            <ComponentShowcaseScreen
              entries={entries}
              onOpenDemo={(id) => navigation.navigate(id)}
              themeActionLabel={preview ? 'Use app theme' : `Preview ${alternate.mode} theme`}
              onToggleTheme={() => setPreview((current) => (current ? undefined : alternate))}
            />
          )}
        </Stack.Screen>
        {entries.map(({ id, title, getComponent }) =>
          getComponent ? (
            <Stack.Screen key={id} name={id} getComponent={getComponent} options={{ title }} />
          ) : null,
        )}
      </Stack.Navigator>
    </ThemeProvider>
  );
};
