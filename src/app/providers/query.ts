import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';
import { ApiError } from '@/core/http/client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      gcTime: 300000,
      retry: (count, error) =>
        count < 2 &&
        (!(error instanceof ApiError) || error.kind === 'network' || (error.status ?? 0) >= 500),
    },
    mutations: { retry: false },
  },
});

export const connectQueryLifecycle = () => {
  const net = NetInfo.addEventListener((state) =>
    onlineManager.setOnline(state.isConnected === true && state.isInternetReachable !== false),
  );
  const app = AppState.addEventListener('change', (state) =>
    focusManager.setFocused(state === 'active'),
  );

  return () => {
    net();
    app.remove();
  };
};
