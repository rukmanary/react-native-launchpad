import { useState } from 'react';
import { useNetworkActivityDevTools } from '@rozenite/network-activity-plugin';
import { useReactNavigationDevTools } from '@rozenite/react-navigation-plugin';
import { useRozeniteStoragePlugin, createMMKVStorageAdapter } from '@rozenite/storage-plugin';
import { usePerformanceMonitorDevTools } from '@rozenite/performance-monitor-plugin';
import { useRozeniteControlsPlugin } from '@rozenite/controls-plugin';
import { clearApiCache } from '../providers/ApiProvider';
import { useApiDevTools } from './useApiDevTools';
import { navigationRef } from '../navigation/ref';
import { preferences } from '../../core/storage/preferences';
const storages = [
  createMMKVStorageAdapter({
    storages: { preferences },
    blacklist: /token|secret|password|credential|session/i,
  }),
];
export function DevTools() {
  const [recordNetwork, setRecordNetwork] = useState(false);
  useNetworkActivityDevTools({
    inspectors: { http: recordNetwork, websocket: recordNetwork, sse: recordNetwork },
  });
  useReactNavigationDevTools({ ref: navigationRef });
  useApiDevTools();
  useRozeniteStoragePlugin({ storages });
  usePerformanceMonitorDevTools();
  useRozeniteControlsPlugin({
    sections: [
      {
        id: 'development',
        title: 'Development',
        items: [
          {
            id: 'network',
            type: 'toggle',
            title: 'Record network traffic',
            description: 'Enable only with test accounts. Payloads may contain private data.',
            value: recordNetwork,
            onUpdate: setRecordNetwork,
          },
          {
            id: 'cache',
            type: 'button',
            title: 'Clear API cache',
            onPress: () => {
              void clearApiCache();
            },
          },
        ],
      },
    ],
  });
  return null;
}
