import * as React from 'react';

import {createNativeStackNavigator, NativeStackScreenProps} from '@react-navigation/native-stack';
import {ParamListBase} from '@react-navigation/native';

import Article from 'views/article/article';
import ArticleCreate from 'views/article-create/article-create';
import AttachmentPreview from 'views/attachment-preview/attachment-preview';
import KnowledgeBase from 'views/knowledge-base/knowledge-base';
import Page from 'views/page/page';
import PreviewFile from 'views/preview-file/preview-file';
import {defaultScreenOptions, Navigators, subscribeToScreenListeners} from 'components/navigation';
import {getStorageState} from 'components/storage/storage';
import {routeMap} from 'app-routes';

import {Activity} from 'types/Activity';
import {Article as ArticleSingle} from 'types/Article';

type KnowledgeBaseStackParams = {
  [routeMap.Article]: any;
  [routeMap.ArticleSingle]: any;
  [routeMap.ArticleCreate]: any;
  [routeMap.KnowledgeBase]: any;
  [routeMap.Page]: any;
  [routeMap.PreviewFile]: any;
};

const KnowledgeBaseStack = createNativeStackNavigator<KnowledgeBaseStackParams>();


export default function KnowledgeBaseStackNavigator({navigation}: NativeStackScreenProps<ParamListBase>) {
  const articleLastVisited: {
    article?: ArticleSingle;
    activities?: Activity[];
  } | null = getStorageState().articleLastVisited;
  const initialRouteName = articleLastVisited ? routeMap.ArticleSingle : routeMap.KnowledgeBase;
  return (
    <KnowledgeBaseStack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={defaultScreenOptions}
      screenListeners={() => subscribeToScreenListeners(Navigators.KnowledgeBaseRoot)}
    >
      <KnowledgeBaseStack.Screen
        name={routeMap.KnowledgeBase}
        component={KnowledgeBase}
      />
      <KnowledgeBaseStack.Screen
        name={routeMap.Article}
        component={Article}
      />
      <KnowledgeBaseStack.Screen
        name={routeMap.ArticleSingle}
        component={Article}
        initialParams={articleLastVisited ? {articlePlaceholder: articleLastVisited.article} : undefined}
      />
      <KnowledgeBaseStack.Screen
        name={routeMap.Page}
        component={Page}
      />
      <KnowledgeBaseStack.Screen
        name={routeMap.ArticleDraft}
        component={ArticleCreate}
      />

      <KnowledgeBaseStack.Group
        screenOptions={{presentation: 'modal'}}
      >
        <KnowledgeBaseStack.Screen
          name={routeMap.ArticleCreate}
          component={ArticleCreate}
        />
        <KnowledgeBaseStack.Screen
          name={routeMap.PreviewFile}
          component={PreviewFile}
        />
        <KnowledgeBaseStack.Screen
          name={routeMap.AttachmentPreview}
          component={AttachmentPreview}
        />
      </KnowledgeBaseStack.Group>

    </KnowledgeBaseStack.Navigator>
  );
}
