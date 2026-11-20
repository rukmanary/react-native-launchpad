import type { ReactNode } from 'react';
import { Text, ScrollView } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Screen } from '@/shared/ui/Screen';
import { Icon } from '@/shared/ui/Icon';
import { config } from '@/core/config/config';

const Tab = createBottomTabNavigator<{ Dashboard: undefined; Modules: undefined }>();

const Modules = () => {
  return (
    <Screen bottomInset={false}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
        <Text accessibilityRole="header" style={{ fontSize: 24 }}>
          Module catalog
        </Text>
        <Text>Enabled: {config.modules.join(', ')}</Text>
        <Text>
          Enable native capabilities with pnpm modules, then rebuild the app. Each module exposes
          typed components and functions from its index.ts.
        </Text>
      </ScrollView>
    </Screen>
  );
};

export function AppTabs({ children }: { children: ReactNode }) {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Dashboard"
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="house" color={color} size={size} />,
        }}
      >
        {() => children}
      </Tab.Screen>
      <Tab.Screen
        name="Modules"
        component={Modules}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="layers" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
