/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from '@/App';
import { initializeModules } from '@/generated/bootstrap';
import { name as appName } from '@/app.json';

initializeModules();
AppRegistry.registerComponent(appName, () => App);
