import React, {Component} from 'react';
import {UIManager} from 'react-native';

import Toast from 'react-native-easy-toast';
import {ActionSheetProvider, connectActionSheet} from '@expo/react-native-action-sheet';
import {Notifications, Notification} from 'react-native-notifications';
import {Provider} from 'react-redux';
import {initialWindowMetrics, SafeAreaProvider} from 'react-native-safe-area-context';

import AppProvider from './app-provider';
import log from 'components/log/log';
import notificationsHelper from 'components/push-notifications/push-notifications-helper';
import store from './store';
import {BottomSheetProvider} from 'components/bottom-sheet';
import {setAccount} from 'actions/app-actions';
import {setNotificationComponent} from 'components/notification/notification';

import type {NotificationRouteData} from 'types/Notification';

if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
require('react-native/Libraries/LogBox/LogBox').ignoreAllLogs();
class YouTrackMobile extends Component<void, void> {
  constructor() {
    super();
    YouTrackMobile.init(YouTrackMobile.getNotificationData);
  }

  static async getNotificationData(): Promise<NotificationRouteData> {
    const notification: Notification | undefined = await Notifications.getInitialNotification();
    log.info(`Initial notification(on start app):: ${JSON.stringify(notification)}`);
    return notificationsHelper.getNotificationRouteData(notification);
  }

  static async init(getNotificationRouteData: () => Promise<NotificationRouteData | null>) {
    let notificationRouteData: NotificationRouteData | null;

    if (getNotificationRouteData) {
      notificationRouteData = await getNotificationRouteData();
    }

    store.dispatch(setAccount(notificationRouteData));
  }

  render() {
    return <AppProvider />;
  }
}

const AppActionSheetConnected = connectActionSheet<{}>(YouTrackMobile);

type ActionSheetRef = React.Ref<unknown> | undefined;

class AppContainer extends Component<void, void> {
  static childContextTypes: any = {
    actionSheet: Function,
  };
  private actionSheetRef: ActionSheetRef;

  getChildContext(): { actionSheet: () => ActionSheetRef; } {
    return {
      actionSheet: () => this.actionSheetRef,
    };
  }

  setActionSheetRef = (component: ActionSheetRef) => {
    if (component) {
      this.actionSheetRef = component;
    }
  };

  render(): React.ReactNode {
    return (
      <Provider store={store}>
        <BottomSheetProvider>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <ActionSheetProvider ref={this.setActionSheetRef} useModal={true}>
              <AppActionSheetConnected/>
            </ActionSheetProvider>
            <Toast ref={toast => toast ? setNotificationComponent(toast) : null}/>
          </SafeAreaProvider>
        </BottomSheetProvider>
      </Provider>
    );
  }
}

module.exports = AppContainer;
