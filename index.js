import Bugsnag from '@bugsnag/react-native';
Bugsnag.start();

import {AppRegistry} from 'react-native';

import YouTrackMobileApp from './src/app';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => YouTrackMobileApp);
