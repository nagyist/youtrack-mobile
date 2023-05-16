import * as React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import EnterServer from 'views/enter-server/enter-server';
import Issues from 'views/issues/issues';
import LogIn from 'views/log-in/log-in';
import Page from 'views/page/page';
import Settings from 'views/settings/settings';
import SettingsAppearance from 'views/settings/settings__appearance';
import SettingsFeedbackForm from 'views/settings/settings__feedback-form';
import {defaultScreenOptions} from 'components/navigation/index';
import {routeMap} from 'app-routes';

type SettingsStackParams = {
  [routeMap.Settings]: any;
  [routeMap.SettingsAppearance]: any;
  [routeMap.SettingsFeedbackForm]: any;
  [routeMap.Page]: any;
};

const SettingsStack = createNativeStackNavigator<SettingsStackParams>();


export default function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator
      initialRouteName={routeMap.Settings}
      screenOptions={defaultScreenOptions}
    >
      <SettingsStack.Screen
        name={routeMap.Settings}
        component={Settings}
      />
      <SettingsStack.Screen
        name={routeMap.EnterServer}
        component={EnterServer}
      />
      <SettingsStack.Screen
        name={routeMap.LogIn}
        component={LogIn}
      />
      <SettingsStack.Screen
        name={routeMap.SettingsAppearance}
        component={SettingsAppearance}
      />
      <SettingsStack.Screen
        name={routeMap.SettingsFeedbackForm}
        component={SettingsFeedbackForm}
      />
      <SettingsStack.Screen
        name={routeMap.Page}
        component={Page}
      />
      <SettingsStack.Screen
        name={routeMap.Issues}
        component={Issues}
        options={{
          ...defaultScreenOptions,
          animation: 'none',
        }}
      />
    </SettingsStack.Navigator>
  );
}
