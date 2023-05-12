import * as React from 'react';
import {Linking} from 'react-native';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';

import LoginStackNavigator from 'components/navigation/navigation-login-stack';
import NavigationBottomTabs from 'components/navigation/navigation-bottom-tabs';
import {navigationRef} from 'components/navigation/navigator';
import {Navigators} from 'components/navigation/index';
import {populateStorage, StorageState} from 'components/storage/storage';
import {routeMap} from 'app-routes';


const Stack = createNativeStackNavigator();
const defaultScreenOptions = {
  headerShown: false,
  lazy: true,
  unmountOnBlur: true,
};


export default function Navigation() {
  const config = {
    screens: {
      [routeMap.Article]: 'articles/:id',
      [routeMap.Issue]: 'issue/:id',
      [routeMap.Issues]: 'issues',
      [routeMap.Issue]: 'issue/:id',
      [routeMap.Ticket]: 'tickets/:id',
      NotFound: '*',
    },
  };

  const linking = {
    prefixes: [
      'https://youtrack.jetbrains.com',
      'https://*.youtrack.cloud',
      'https://*.myjetbrains.com',
    ],
    config,
  };

  const [isReady, setIsReady] = React.useState<boolean>(false);
  const init = async () => {
    try {
      const initialUrl: string | null = await Linking.getInitialURL();
      if (!initialUrl) {
        populateStorage()
          .then((storageState: StorageState) => {
            setIsReady(!!storageState.config);
          });
      }
    } finally {
      setIsReady(true);
    }
  };

  React.useEffect(() => {
    init();
  }, []);

  return (
    <NavigationContainer
      linking={linking}
      ref={navigationRef}
    >

      <Stack.Navigator>
        {
          isReady ? (
            <Stack.Screen
              options={{
                ...defaultScreenOptions,
                animation: 'none',
              }}
              name={Navigators.BottomTabs}
              component={NavigationBottomTabs}
            />
            )
        : (
          <Stack.Screen
            name={Navigators.LoginRoot}
            options={defaultScreenOptions}
            component={LoginStackNavigator}
          />
            )
        }
      </Stack.Navigator>
    </NavigationContainer>
  );
}
