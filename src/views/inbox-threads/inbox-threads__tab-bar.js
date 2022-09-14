/* @flow */

import React, {useRef, useContext} from 'react';
import {Text, View} from 'react-native';

import {IconCircle} from 'components/icon/icon';
import {ThemeContext} from 'components/theme/theme-context';
import {useSelector} from 'react-redux';

import styles from './inbox-threads.styles';
import tabStyles from 'components/issue-tabbed/issue-tabbed.style';

import type {AppState} from '../../reducers';
import type {InboxFolder} from 'flow/Inbox';
import type {TabRoute} from 'flow/Issue';
import type {Theme} from 'flow/Theme';


const InboxThreadsTabBar = ({route, focused, index}: { route: TabRoute, focused: boolean, index: number }) => {
  // eslint-disable-next-line no-unused-vars
  const theme: Theme = useContext(ThemeContext);
  const refEl = useRef();

  const inboxThreadsFolders: InboxFolder[] = useSelector((state: AppState) => state.app.inboxThreadsFolders);

  const tabHasUpdates = (): boolean => {
    const folder: ?InboxFolder = inboxThreadsFolders.find((it: InboxFolder) => it.id === route.id);
    return !!folder && (folder.lastNotified > folder.lastSeen);
  };

  return (
    <View
      collapsable={false}
      ref={refEl}
    >
      <Text
        style={[
          tabStyles.tabLabelText,
          focused && {color: styles.link.color},
        ]}
      >
        {route.title}
      </Text>
      {!focused && index > 0 && tabHasUpdates() && (
        <IconCircle
          size={9}
          color={styles.link.color}
          style={styles.tabTitleIconUnread}
        />
      )}
    </View>
  );
};


export default React.memo(InboxThreadsTabBar);
