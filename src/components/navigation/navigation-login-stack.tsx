import * as React from 'react';

import {createNativeStackNavigator, NativeStackScreenProps} from '@react-navigation/native-stack';
import {ParamListBase} from '@react-navigation/native';

import EnterServer from 'views/enter-server/enter-server';
import Home from 'views/home/home';
import LogIn from 'views/log-in/log-in';
import {defaultScreenOptions} from 'components/navigation/index';
import {routeMap} from 'app-routes';

type ServerLoginStackParams = {
  [routeMap.EnterServer]: any;
  [routeMap.Home]: any;
  [routeMap.LogIn]: any;
};

const ServerLogin = createNativeStackNavigator<ServerLoginStackParams>();

export default function LoginStackNavigator(props: NativeStackScreenProps<ParamListBase>) {

  return (
    <ServerLogin.Navigator
      initialRouteName={routeMap.Home}
      screenOptions={defaultScreenOptions}
    >
      <ServerLogin.Screen
        name={routeMap.Home}
        component={Home}
      />
      <ServerLogin.Screen
        name={routeMap.EnterServer}
        component={EnterServer}
      />
      <ServerLogin.Screen
        name={routeMap.LogIn}
        component={LogIn}
      />

    </ServerLogin.Navigator>
  );
}
