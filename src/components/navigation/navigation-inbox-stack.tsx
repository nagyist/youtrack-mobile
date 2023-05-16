import * as React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ParamListBase} from '@react-navigation/native';

import Article from 'views/article/article';
import Inbox from 'views/inbox/inbox';
import InboxThreads from 'views/inbox-threads/inbox-threads';
import Issue from 'views/issue/issue';
import LinkedIssues from 'components/linked-issues/linked-issues';
import LinkedIssuesAddLink from 'components/linked-issues/linked-issues-add-link';
import {checkVersion, FEATURE_VERSION} from 'components/feature/feature';
import {defaultScreenOptions, Navigators, subscribeToScreenListeners} from 'components/navigation';
import {routeMap} from 'app-routes';

type InboxStackParams = {
  [routeMap.Article]: any;
  [routeMap.Inbox]: any;
  [routeMap.InboxThreads]: any;
  [routeMap.Issue]: any;
  [routeMap.LinkedIssues]: any;
  [routeMap.LinkedIssuesAddLink]: any;
};

const InboxStack = createNativeStackNavigator<InboxStackParams>();


const getCommonIssueStack = (StackName, postfix: string = '') => {
  return (
    <StackName.Group>
      <StackName.Screen
        name={`${routeMap.Issue}${postfix}`}
        component={Issue}
      />
      <StackName.Screen
        name={`${routeMap.LinkedIssues}${postfix}`}
        component={LinkedIssues}
      />
      <StackName.Screen
        name={`${routeMap.LinkedIssuesAddLink}${postfix}`}
        component={LinkedIssuesAddLink}
      />
    </StackName.Group>
  );
};

export default function InboxStackNavigator({navigation}: NativeStackScreenProps<ParamListBase>) {
  const isInboxThreadsEnabled: boolean = checkVersion(FEATURE_VERSION.inboxThreads);
  return (
    <InboxStack.Navigator
      initialRouteName={isInboxThreadsEnabled ? routeMap.InboxThreads : routeMap.Inbox}
      screenOptions={defaultScreenOptions}
      screenListeners={() => subscribeToScreenListeners(Navigators.InboxRoot)}
    >
      <InboxStack.Screen
        name={routeMap.Inbox}
        component={Inbox}
      />
      <InboxStack.Screen
        name={routeMap.InboxThreads}
        component={isInboxThreadsEnabled ? InboxThreads : Inbox}
      />
      <InboxStack.Screen
        name={routeMap.Article}
        component={Article}
      />

      {getCommonIssueStack(InboxStack)}
    </InboxStack.Navigator>
  );
}
