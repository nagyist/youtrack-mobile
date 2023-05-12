import * as React from 'react';

import {NavigationNavigateActionPayload, NavigationScreenProp, NavigationState} from 'react-navigation';

import {routeMap} from 'app-routes';

export type BottomTabsScreen = Record<NavigationRootNames, any>;
export type NavigationRootNames = keyof typeof routeMap;

enum Navigators {
  AgileRoot = 'AgileRoot',
  BottomTabs = 'BottomTabs',
  InboxRoot = 'InboxRoot',
  IssuesRoot = 'IssuesRoot',
  KnowledgeBaseRoot = 'KnowledgeBaseRoot',
  LoginRoot = 'LoginRoot',
  SettingsRoot = 'SettingsRoot',
}

export interface INavigationParams {
  navigation: NavigationScreenProp<NavigationState>,
  route: NavigationNavigateActionPayload
}

const defaultScreenOptions = {
  gestureEnabled: true,
  headerShown: false,
  lazy: true,
  unmountOnBlur: true,
};

const spreadNavigationProps = (props: INavigationParams): INavigationParams & Record<string, any> => {
  return {...props, ...props?.route?.params};
};

const mixinNavigationProps = (Component: any): any => (props: INavigationParams) => {
  return <Component {...spreadNavigationProps(props)}/>;
};


export {
  mixinNavigationProps,
  Navigators,
  defaultScreenOptions,
  spreadNavigationProps,
};

