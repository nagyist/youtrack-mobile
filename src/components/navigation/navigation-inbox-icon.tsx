import React from 'react';
import {View} from 'react-native';

import {View as AnimatedView} from 'react-native-animatable';
import {useDispatch, useSelector} from 'react-redux';

import {checkVersion, FEATURE_VERSION} from 'components/feature/feature';
import {folderIdMap} from 'views/inbox-threads/inbox-threads-helper';
import {IconBell, IconCircle} from 'components/icon/icon';
import {inboxCheckUpdateStatus} from 'actions/app-actions';

import {InboxFolder} from 'types/Inbox';

import styles from './navigation.styles';

import type {AppState} from 'reducers';

export const menuPollInboxStatusDelay: number = 60 * 1000;


export default function NavigationInboxIcon({color, size} : { color: string; size: number }) {
  const dispatch = useDispatch();

  const isInboxThreadsEnabled: boolean = checkVersion(FEATURE_VERSION.inboxThreads);

  const interval = React.useRef<React.MutableRefObject<typeof setInterval | null>>();

  const isChangingAccount: boolean = useSelector((appState: AppState) => appState.app.isChangingAccount);
  const hasNewNotifications: boolean = useSelector((appState: AppState) => {
    if (!isInboxThreadsEnabled) {
      return false;
    }

    const inboxFolders: InboxFolder[] = appState.app.inboxThreadsFolders.filter(
      it => it?.id === folderIdMap[1] || it?.id === folderIdMap[2],
    ) || [];
    return (
      inboxFolders.length > 0 &&
      inboxFolders.some(it => it?.lastNotified > it?.lastSeen)
    );
  });

  const setInboxHasUpdateStatus = React.useCallback(() => {
    dispatch(inboxCheckUpdateStatus());
  }, [dispatch]);

  React.useEffect(() => {
    const unsubscribe = () => {
      if (interval.current) {
        clearInterval(interval.current);
        interval.current = null;
      }
    };

    if (isInboxThreadsEnabled && !isChangingAccount) {
      unsubscribe();
      interval.current = setInterval(
        setInboxHasUpdateStatus,
        menuPollInboxStatusDelay,
      );
      setInboxHasUpdateStatus();
    }

    return unsubscribe;
  }, [isInboxThreadsEnabled, setInboxHasUpdateStatus, isChangingAccount]);

  return (
    <View
      testID="test:id/menuIssuesInboxIcon"
      accessibilityLabel="menuIssuesInboxIcon"
      accessible={true}
    >
      {isInboxThreadsEnabled && hasNewNotifications && (
        <AnimatedView
          useNativeDriver
          duration={1000}
          animation="fadeIn"
          style={styles.circleIcon}
        >
          <IconCircle size={10} color={styles.link.color}/>
        </AnimatedView>
      )}
      <IconBell
        size={size}
        color={color}
      />
    </View>
  );
}
