import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabRoutes = {
  Home: undefined;
  Component: undefined;
  API: undefined;
  Profile: undefined;
};

export type RootStackRoutes = {
  Main: NavigatorScreenParams<MainTabRoutes> | undefined;
  Form: undefined;
  Products: undefined;
  StarterKit: undefined;
};
