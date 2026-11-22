import { createBottomTabNavigator, type BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabRoutes, RootStackRoutes } from '@/app/navigation/routes';
import { HomeScreen } from '@/features/home';
import { ComponentShowcaseNavigator } from '@/app/navigation/ComponentShowcaseNavigator';
import { ApiShowcaseScreen } from '@/features/api-showcase';
import { ProfileScreen } from '@/features/profile';
import { Icon } from '@/shared/ui/Icon';
import { useTheme } from '@/shared/theme/theme';
import { ScreenInsetsProvider } from '@/shared/ui/Screen';

const Tab = createBottomTabNavigator<MainTabRoutes>();

type HomeRouteProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabRoutes, 'Home'>,
  NativeStackScreenProps<RootStackRoutes, 'Main'>
>;

const HomeRoute = ({ navigation }: HomeRouteProps) => (
  <HomeScreen
    onOpenForm={() => navigation.navigate('Form')}
    onOpenCatalog={() => navigation.navigate('Products')}
    onOpenStarterKit={() => navigation.navigate('StarterKit')}
  />
);

export const AppTabs = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        lazy: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
      screenLayout={({ children }) => (
        <ScreenInsetsProvider bottomHandled>{children}</ScreenInsetsProvider>
      )}
    >
      <Tab.Screen
        name="Home"
        component={HomeRoute}
        options={{
          tabBarButtonTestID: 'tab-home',
          tabBarIcon: ({ color, size }) => <Icon name="house" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Component"
        component={ComponentShowcaseNavigator}
        options={{
          tabBarButtonTestID: 'tab-component',
          tabBarIcon: ({ color, size }) => <Icon name="layout-grid" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="API"
        component={ApiShowcaseScreen}
        options={{
          tabBarButtonTestID: 'tab-api',
          tabBarIcon: ({ color, size }) => <Icon name="code-xml" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarButtonTestID: 'tab-profile',
          tabBarIcon: ({ color, size }) => <Icon name="user-round" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};
