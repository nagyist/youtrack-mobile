import {Slice} from '@reduxjs/toolkit';
import {
  attachmentTypes,
  modalIssueNamespace,
} from './issue.modal__attachment-actions-and-types';
import {commandDialogNamespace} from '../issue-action-types';
import {
  createAttachmentReducer,
  createIssueReduxSlice,
  initialState,
} from '../issue-base-reducer';
import {createCommandDialogReducers} from 'components/command-dialog/command-dialog-reducer';

import type {IssueState} from '../issue-base-reducer';
export type {IssueState as State}; //TODO

export {initialState}; //TODO

const {actions, reducer}: typeof Slice = createIssueReduxSlice(
  modalIssueNamespace,
  {
    ...createAttachmentReducer(attachmentTypes),
    ...createCommandDialogReducers(commandDialogNamespace),
  },
);
export {actions};
export default reducer;
