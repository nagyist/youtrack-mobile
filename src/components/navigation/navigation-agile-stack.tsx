import * as React from 'react';

import {createNativeStackNavigator, NativeStackScreenProps} from '@react-navigation/native-stack';
import {ParamListBase} from '@react-navigation/native';

import AgileBoard from 'views/agile-board/agile-board';
import AttachmentPreview from 'views/attachment-preview/attachment-preview';
import Issue from 'views/issue/issue';
import LinkedIssues from 'components/linked-issues/linked-issues';
import LinkedIssuesAddLink from 'components/linked-issues/linked-issues-add-link';
import PreviewFile from 'views/preview-file/preview-file';
import {defaultScreenOptions} from 'components/navigation/index';
import {routeMap} from 'app-routes';

type IssueLinksStackParams = {
  [routeMap.AttachmentPreview]: any;
  [routeMap.Issue]: any;
  [routeMap.LinkedIssues]: any;
  [routeMap.LinkedIssuesAddLink]: any;
};

type AgileStackParams = IssueLinksStackParams & {
  [routeMap.AgileBoard]: any;
  [routeMap.PreviewFile]: any;
};


const AgileStack = createNativeStackNavigator<AgileStackParams>();

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

export default function AgileStackNavigator({navigation}: NativeStackScreenProps<ParamListBase>) {
  return (
    <AgileStack.Navigator
      initialRouteName={routeMap.AgileBoard}
      screenOptions={defaultScreenOptions}
    >
      <AgileStack.Screen
        name={routeMap.AgileBoard}
        component={AgileBoard}
      />

      {getCommonIssueStack(AgileStack)}

      <AgileStack.Group
        screenOptions={{presentation: 'modal'}}
      >
        <AgileStack.Screen
          name={routeMap.AttachmentPreview}
          component={AttachmentPreview}
        />
        <AgileStack.Screen
          name={routeMap.PreviewFile}
          component={PreviewFile}
        />

        {getCommonIssueStack(AgileStack, 'Modal')}
      </AgileStack.Group>
    </AgileStack.Navigator>
  );
}
