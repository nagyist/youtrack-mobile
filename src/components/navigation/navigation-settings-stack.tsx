import * as React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ParamListBase} from '@react-navigation/native';

import EnterServer from 'views/enter-server/enter-server';
import LogIn from 'views/log-in/log-in';
import Settings from 'views/settings/settings';
import SettingsAppearance from 'views/settings/settings__appearance';
import SettingsFeedbackForm from 'views/settings/settings__feedback-form';
import {defaultScreenOptions} from 'components/navigation/index';
import {routeMap} from 'app-routes';
import Page from 'views/page/page';

type SettingsStackParams = {
  [routeMap.Settings]: any;
  [routeMap.SettingsAppearance]: any;
  [routeMap.SettingsFeedbackForm]: any;
  [routeMap.Page]: any;
};

const SettingsStack = createNativeStackNavigator<SettingsStackParams>();

export default function SettingsStackNavigator({navigation}: NativeStackScreenProps<ParamListBase>) {
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

      <SettingsStack.Group
        screenOptions={{presentation: 'modal'}}
      >
      </SettingsStack.Group>

    </SettingsStack.Navigator>
  );
}
