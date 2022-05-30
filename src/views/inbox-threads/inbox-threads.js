/* @flow */

import React, {useContext, useEffect} from 'react';
import {FlatList, RefreshControl, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import actions from './inbox-threads-actions';
import ErrorMessage from 'components/error-message/error-message';
import Header from 'components/header/header';
import Thread from './inbox-threads__thread';
import {guid} from 'util/util';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './inbox-threads.styles';

import type {AppState} from '../../reducers';
import type {CustomError} from 'flow/Error';
import type {InboxThread} from 'flow/Inbox';
import type {Node} from 'react';
import type {Theme} from 'flow/Theme';
import type {User} from 'flow/User';


const InboxThreads: () => Node = (): Node => {
  const theme: Theme = useContext(ThemeContext);
  const dispatch = useDispatch();

  const threads: Array<InboxThread> = useSelector((state: AppState) => state.inboxThreads.threads);
  const currentUser: User = useSelector((state: AppState) => state.app.user);
  const inProgress: boolean = useSelector((state: AppState) => state.inboxThreads.inProgress);
  const error: ?CustomError = useSelector((state: AppState) => state.inboxThreads.error);
  const doRefresh = () => {dispatch(actions.loadInboxThreads());};

  useEffect(
    doRefresh,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <View style={styles.container}>
      <Header
        showShadow={true}
        title="Notifications"
      />

      {threads.length > 0 && (
        <FlatList
          data={threads}
          ItemSeparatorComponent={() => <View style={styles.threadSeparator}/>}
          keyExtractor={guid}
          renderItem={({item, index}: {item: InboxThread, index: number}) => {
            return item.messages.length && (
              <View
                style={[styles.thread, (index === threads.length - 1) && styles.threadLast]}
              >
                <Thread
                  thread={item}
                  currentUser={currentUser}
                  uiTheme={theme.uiTheme}
                />
              </View>
            );
          }}
          refreshControl={<RefreshControl
            refreshing={inProgress}
            tintColor={styles.link.color}
            onRefresh={doRefresh}
          />}
        />
      )}

      {!!error && !inProgress && (
        <View style={styles.error}>
          <ErrorMessage error={error}/>
        </View>
      )}
    </View>
  );
};


export default InboxThreads;
