/* @flow */

import React from 'react';
import {View} from 'react-native';

import MarkdownViewChunks from 'components/wiki/markdown-view-chunks';
import Router from 'components/router/router';
import StreamHistoryChange from 'components/activity-stream/activity__stream-history';
import ThreadItem from './inbox-threads__item';
import {activityCategory} from 'components/activity/activity__category';
import {i18n} from 'components/i18n/i18n';
import {IconHistory} from 'components/icon/icon';
import {markdownText} from 'components/common-styles/typography';

import styles from './inbox-threads.styles';

import {InboxThreadGroup} from 'flow/Inbox';
import type {AnyIssue} from 'flow/Issue';
import type {CustomField} from 'flow/CustomFields';
import type {InboxThreadTarget} from 'flow/Inbox';
import type {UITheme} from 'flow/Theme';

interface Props {
  group: InboxThreadGroup;
  target: InboxThreadTarget;
  uiTheme: UITheme;
}

export default function ThreadIssueCreatedItem({group, target, uiTheme}: Props) {
  const actualActivity: Props['group']['issue'] = group.issue;
  const issue: AnyIssue = actualActivity.issue;
  const assigneeFields: CustomField[] = (issue.customFields || []).map((it: CustomField) => {
    return {
      ...it,
      projectCustomField: {
        ...it.projectCustomField,
        field: {id: it.id},
      },
    };
  });
  const added = assigneeFields.reduce(
    (acc: CustomField[], it: CustomField) => acc.concat(it.value), []
  ).filter(Boolean);

  const activity = {
    category: {id: activityCategory.CUSTOM_FIELD},
    added: added.length > 0 ? added : null,
    removed: [],
    field: {
      presentation: assigneeFields[0]?.name,
      customField: {
        id: assigneeFields[0]?.id,
        fieldType: {
          isMultiValue: assigneeFields.length > 1,
        },
      },
    },
  };

  return (
    <ThreadItem
      author={actualActivity.author}
      avatar={<IconHistory size={20} color={styles.icon.color}/>}
      change={<>
        {Boolean(issue.description) && (
          <MarkdownViewChunks
            textStyle={markdownText}
            attachments={issue.attachments}
            chunkSize={3}
            maxChunks={1}
            uiTheme={uiTheme}
          >
            {issue.description.trim()}
          </MarkdownViewChunks>
        )}
        <View style={styles.threadRelatedChange}>
          <StreamHistoryChange activity={activity} customFields={assigneeFields}/>
        </View>
      </>}
      onPress={() => Router.Issue({issueId: target.id})}
      reason={i18n('created')}
      timestamp={actualActivity.timestamp}
    />
  );
}