import * as React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ParamListBase} from '@react-navigation/native';

import AttachmentPreview from 'views/attachment-preview/attachment-preview';
import CreateIssue from 'views/create-issue/create-issue';
import EnterServer from 'views/enter-server/enter-server';
import Issue from 'views/issue/issue';
import Issues from 'views/issues/issues';
import LinkedIssues from 'components/linked-issues/linked-issues';
import LinkedIssuesAddLink from 'components/linked-issues/linked-issues-add-link';
import LogIn from 'views/log-in/log-in';
import Page from 'views/page/page';
import PreviewFile from 'views/preview-file/preview-file';
import {defaultScreenOptions, Navigators, subscribeToScreenListeners} from 'components/navigation';
import {routeMap} from 'app-routes';

type IssueLinksStackParams = {
  [routeMap.AttachmentPreview]: any;
  [routeMap.Issue]: any;
  [routeMap.LinkedIssues]: any;
  [routeMap.LinkedIssuesAddLink]: any;
  [routeMap.Page]: any;
  [routeMap.PreviewFile]: any;
};

type IssuesStackParams = IssueLinksStackParams & {
  [routeMap.CreateIssue]: any;
  [routeMap.EnterServer]: any;
  [routeMap.Issues]: any;
  [routeMap.LogIn]: any;
};


const IssuesStack = createNativeStackNavigator<IssuesStackParams>();

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

export default function IssuesStackNavigator({navigation}: NativeStackScreenProps<ParamListBase>) {
  return (
    <IssuesStack.Navigator
      key={Navigators.IssuesRoot}
      initialRouteName={routeMap.Issues}
      screenOptions={defaultScreenOptions}
      screenListeners={() => subscribeToScreenListeners(Navigators.IssuesRoot)}
    >
      <IssuesStack.Group>
        <IssuesStack.Screen
          name={routeMap.EnterServer}
          component={EnterServer}
        />
        <IssuesStack.Screen
          name={routeMap.LogIn}
          component={LogIn}
        />
      </IssuesStack.Group>

      <IssuesStack.Screen
        name={routeMap.Issues}
        component={Issues}
      />

      {getCommonIssueStack(IssuesStack)}

      <IssuesStack.Group
        screenOptions={{presentation: 'modal'}}
      >
        <IssuesStack.Screen
          name={routeMap.CreateIssue}
          component={CreateIssue}
        />
        <IssuesStack.Screen
          name={routeMap.AttachmentPreview}
          component={AttachmentPreview}
        />
        <IssuesStack.Screen
          name={routeMap.PreviewFile}
          component={PreviewFile}
        />
        <IssuesStack.Screen
          name={routeMap.Page}
          component={Page}
        />

        {getCommonIssueStack(IssuesStack, 'Modal')}
      </IssuesStack.Group>
    </IssuesStack.Navigator>
  );
}
