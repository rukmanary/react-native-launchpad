import { Component, type PropsWithChildren } from 'react';
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { StateProvider } from '@/app/store/StateProvider';
import { I18nextProvider } from 'react-i18next';

import { ApiProvider } from '@/app/providers/ApiProvider';
import { i18n } from '@/app/providers/i18n';
import { Navigation } from '@/app/navigation/Navigation';
import { useTheme } from '@/shared/theme/theme';

class ErrorBoundary extends Component<PropsWithChildren, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Text accessibilityRole="alert">
          The app could not start. Restart the app and check its configuration.
        </Text>
      </View>
    ) : (
      this.props.children
    );
  }
}

const DevTools = __DEV__ ? require('@/app/devtools/DevTools').DevTools : () => null;

export const App = () => {
  const { colors } = useTheme();

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <KeyboardProvider>
            <StateProvider>
              <ApiProvider>
                <I18nextProvider i18n={i18n}>
                  <Navigation />
                  <DevTools />
                </I18nextProvider>
              </ApiProvider>
            </StateProvider>
          </KeyboardProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};
