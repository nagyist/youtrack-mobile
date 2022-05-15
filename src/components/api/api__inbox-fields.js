/* @flow */

import ApiHelper from './api__helper';

import {ISSUE_ACTIVITIES_FIELDS, PULL_REQUEST_FIELDS} from './api__activities-issue-fields';
import issueFields from './api__issue-fields';

import type {ToField} from 'flow/ToField';


const toField = ApiHelper.toField;
const excludeArray = [
  'noUserReason(id)', 'noHubUserReason(id)', 'version', 'files', 'reopened',
  'commands(end,errorText,hasError,start)', 'userName', 'urls', 'shortName', 'fetched', 'hasEmail', 'state(id)',
];

export const _fields: ToField = toField([
  'id',
  {
    subject: [
      'id',
      {
        target: [
          'id',
          'idReadable',
          'resolved',
          'summary',
        ],
      },
    ],
  },
  {
    messages: [
      'id',
      'threadId',
      'timestamp',
      {
        activities: ISSUE_ACTIVITIES_FIELDS,
      },
      {
        reasons: [
          'id',
          'name',
          'type',
        ],
      },
    ],
  },
  'muted',
  'notified',
]);

const entity = 'id,idReadable,summary,resolved';
export const fields: ToField = toField([
  'id',
  'notified',
  'muted',
  {
    subject: [
      'id',
      {
        target: toField([
        entity, // issue, article
          {
            issue: entity, // comment issue
            article: entity, // comment article
          },
        ]),
      },
    ],
    messages: [
      'id',
      'threadId',
      'timestamp',
      'read',
      'reasons(id,name,type)',
      {
        activities: toField([
          'emptyFieldText',
          'pseudo',
          ISSUE_ACTIVITIES_FIELDS
            .exclude(toField([
              {authorGroup: ['icon', 'name']},
              {pullRequest: PULL_REQUEST_FIELDS},
            ]))
            .exclude(toField({added: excludeArray}))
            .exclude(toField({removed: excludeArray})),
          {
            comment: toField([
              'id',
              'text',
              'deleted',
              'reactionOrder',
              {
                issue: 'id',
                article: 'id',
                reactions: issueFields.reaction,
                mentionedUsers: issueFields.ISSUE_USER_FIELDS,
              },
            ]),
            issue: toField([
              'id',
              'description',
              {
                customFields: toField([
                  'name',
                  {
                    'projectCustomField': [
                      'emptyFieldText',
                    ],
                  },
                  {
                    'value': [
                      'id',
                      'name',
                      'ringId',
                      'login',
                      'avatarUrl',
                      'fullName',
                      'isLocked',
                    ],
                  },
                ]),
                mentionedUsers: issueFields.ISSUE_USER_FIELDS,
              },
            ]),
            article: toField([
              'id',
              'content',
              {
                mentionedUsers: issueFields.ISSUE_USER_FIELDS,
              },
            ]),
          },
        ]),
      },
    ],
  },
]);
