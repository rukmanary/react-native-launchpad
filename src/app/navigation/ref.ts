import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackRoutes } from '@/app/navigation/routes';

export const navigationRef = createNavigationContainerRef<RootStackRoutes>();
