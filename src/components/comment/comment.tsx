import {View, Text, TouchableWithoutFeedback} from 'react-native';
import React from 'react';
import Avatar from '../avatar/avatar';
import HTML from 'components/wiki/renderers/renderer__html';
import MarkdownView from 'components/wiki/markdown-view';
import YoutrackWiki from 'components/wiki/youtrack-wiki';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {i18n} from 'components/i18n/i18n';
import {isPureHTMLBlock, prepareHTML} from 'components/wiki/markdown-helper';
import {markdownText} from 'components/common-styles/typography';
import {ytDate} from 'components/date/date';
import styles from './comment.styles';
import type {IssueComment, Attachment} from 'flow/CustomFields';
import type {UITheme} from 'flow/Theme';
import type {YouTrackWiki} from 'flow/Wiki';
type Props = {
  comment: IssueComment;
  attachments?: Array<Attachment>;
  youtrackWiki?: YouTrackWiki;
  canRestore: boolean;
  onRestore: (...args: Array<any>) => any;
  onLongPress: (...args: Array<any>) => any;
  canDeletePermanently: boolean;
  onDeletePermanently: (...args: Array<any>) => any;
  activitiesEnabled?: boolean;
  uiTheme: UITheme;
  onCheckboxUpdate?: (checked: boolean, position: number) => void;
};

function Comment(props: Props) {
  const renderDeletedComment = () => {
    const {
      onRestore,
      onDeletePermanently,
      canRestore,
      canDeletePermanently,
    } = props;
    return (
      <>
        <View>
          <Text style={styles.deletedCommentText}>
            {i18n('Comment deleted')}
          </Text>
        </View>

        {Boolean(canRestore || canDeletePermanently) && (
          <View style={styles.actions}>
            <Text>
              {canRestore && (
                <Text onPress={onRestore} style={styles.actionLink}>
                  {i18n('Restore')}
                </Text>
              )}
              {canDeletePermanently && (
                <Text style={styles.text}>{i18n(' or ')}</Text>
              )}
              {canDeletePermanently && (
                <Text onPress={onDeletePermanently} style={styles.actionLink}>
                  {i18n('Delete permanently')}
                </Text>
              )}
            </Text>
          </View>
        )}
      </>
    );
  };

  const renderYoutrackWiki = () => {
    const {backendUrl, onIssueIdTap, imageHeaders} = props.youtrackWiki;
    return (
      <View style={styles.commentWikiContainer}>
        <YoutrackWiki
          backendUrl={backendUrl}
          onIssueIdTap={issueId => onIssueIdTap(issueId)}
          attachments={props.attachments}
          imageHeaders={imageHeaders}
          uiTheme={props.uiTheme}
        >
          {comment.textPreview}
        </YoutrackWiki>
      </View>
    );
  };

  const renderMarkdown = () => {
    if (props.comment.hasEmail || isPureHTMLBlock(props.comment.text)) {
      return <HTML html={prepareHTML(props.comment.text)} />;
    }

    return (
      <MarkdownView
        textStyle={markdownText}
        testID="commentMarkdown"
        attachments={props.attachments}
        onCheckboxUpdate={(checked: boolean, position: number) =>
          props.onCheckboxUpdate && props.onCheckboxUpdate(checked, position)
        }
      >
        {props.comment.text}
      </MarkdownView>
    );
  };

  const renderComment = () => {
    const {comment, onLongPress} = props;
    const usesMarkdown: boolean = comment.usesMarkdown;
    const testID: string = comment.deleted
      ? 'commentDeleted'
      : usesMarkdown
      ? 'commentMarkdown'
      : 'commentYTWiki';
    return (
      <TouchableWithoutFeedback delayLongPress={280} onLongPress={onLongPress}>
        <View testID={testID}>
          {comment.deleted && renderDeletedComment()}
          {!comment.deleted &&
            (usesMarkdown || !comment.textPreview) &&
            renderMarkdown()}
          {!comment.deleted &&
            !usesMarkdown &&
            !!comment.textPreview &&
            renderYoutrackWiki()}
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const {comment, uiTheme, activitiesEnabled = true} = props;

  if (activitiesEnabled) {
    return renderComment();
  }

  const userPresentation: string = getEntityPresentation(comment?.author);
  return (
    <View testID="commentLegacy" style={styles.commentWrapper}>
      <Avatar
        userName={userPresentation}
        size={40}
        source={{
          uri: comment.author.avatarUrl,
        }}
      />
      <View style={styles.comment}>
        <Text>
          <Text testID="commentLegacyAuthor" style={styles.authorName}>
            {userPresentation}
          </Text>
          <Text
            style={{
              color: uiTheme.colors.$icon,
            }}
          >
            {' '}
            {ytDate(comment.created)}
          </Text>
        </Text>
        <View style={styles.commentText}>{renderComment()}</View>
      </View>
    </View>
  );
}

export default React.memo<Props>(Comment) as React$AbstractComponent<
  Props,
  unknown
>;