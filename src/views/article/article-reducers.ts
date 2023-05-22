import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import {issuePermissionsNull} from 'components/issue-permissions/issue-permissions-helper';

import type {Activity} from 'types/Activity';
import type {Article, ArticlesList} from 'types/Article';
import type {CustomError} from 'types/Error';
import type {IssueComment} from 'types/CustomFields';

export type ArticleState = {
  activityPage: Activity[] | null;
  article: Article;
  articleCommentDraft: IssueComment | null;
  articlesList: ArticlesList;
  error: CustomError;
  isLoading: boolean;
  isProcessing: boolean;
  issuePermissions: IssuePermissions;
  prevArticleState: ArticleState | null | undefined;
};
export const articleInitialState: ArticleState = {
  activityPage: null,
  article: null,
  articleCommentDraft: null,
  articlesList: [],
  error: null,
  isLoading: false,
  isProcessing: false,
  issuePermissions: issuePermissionsNull,
  prevArticleState: null,
};
const {reducer, actions} = createSlice({
  name: 'article',
  initialState: articleInitialState,
  reducers: {
    setProcessing(state: ArticleState, action: PayloadAction<boolean>) {
      state.isProcessing = action.payload;
    },

    setError(state: ArticleState, action: PayloadAction<boolean>) {
      state.error = action.payload;
    },

    setArticle(state: ArticleState, action: PayloadAction<Article>) {
      state.article = action.payload;
    },

    setActivityPage(
      state: ArticleState,
      action: PayloadAction<Activity[]>,
    ) {
      state.activityPage = action.payload;
    },

    setPrevArticle(state: ArticleState, action: PayloadAction<ArticleState>) {
      state.prevArticleState = action.payload;
    },

    setArticleCommentDraft(
      state: ArticleState,
      action: PayloadAction<Article>,
    ) {
      state.articleCommentDraft = action.payload;
    },
  },
  extraReducers: {},
}) as any;
export const {
  setError,
  setArticle,
  setActivityPage,
  setProcessing,
  setPrevArticle,
  setArticleCommentDraft,
} = actions;
export default reducer;
