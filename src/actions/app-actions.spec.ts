import {Linking} from 'react-native';

import configureMockStore from 'redux-mock-store';
import fetchMock from 'fetch-mock';
import thunk from 'redux-thunk';

import * as actions from './app-actions';
import * as appActionHelper from './app-actions-helper';
import * as feature from 'components/feature/feature';
import * as Notification from 'components/notification/notification';
import * as storage from 'components/storage/storage';
import * as storageOauth from 'components/storage/storage__oauth';
import * as types from './action-types';
import * as urlUtils from '../components/open-url-handler/open-url-handler';
import API from 'components/api/api';
import log from 'components/log/log';
import mocks from '../../test/mocks';
import OAuth2 from 'components/auth/oauth2';
import permissionsHelper from 'components/permissions-store/permissions-helper';
import PermissionsStore from 'components/permissions-store/permissions-store';
import PushNotifications from 'components/push-notifications/push-notifications';
import {folderIdAllKey} from 'views/inbox-threads/inbox-threads-helper';
import Router from 'components/router/router';

import {PermissionCacheItem} from 'types/Permission';
import {AppConfig} from 'types/AppConfig';
import {AuthParams} from 'types/Auth';
import {RootState} from 'reducers/app-reducer';
import {StorageState} from 'components/storage/storage';
import {Store} from 'redux';
import {User} from 'types/User';

jest.mock('components/storage/storage', () => {
  const st = jest.requireActual('components/storage/storage');
  return {
    ...st,
    clearStorage: jest.fn(),
  };
});

jest.mock('components/router/router', () => ({
  navigateToDefaultRoute: jest.fn(),
  Home: jest.fn(),
  EnterServer: jest.fn(),
}));


const backendURLMock = 'https://example.com';
let appConfigMock: AppConfig | Partial<AppConfig>;
let apiMock: API;
let appStateMock: Partial<RootState>;
let store: Store;
let userMock: User;
let authParamsMock: AuthParams;

const getApi = () => apiMock;

const middlewares = [thunk.withExtraArgument(getApi)];
const storeMock = configureMockStore(middlewares);


describe('app-actions', () => {
  beforeEach(async () => {
    mockGetAuthParamsFromCache();
    apiMock = createAPIMock();
    appStateMock = {
      auth: createAuthInstanceMock(),
    } as any as RootState;
    updateStore({...appStateMock});

    await storage.populateStorage();
  });
  afterEach(() => {
    (storageOauth.getStoredSecurelyAuthParams as jest.Mock).mockClear();
  });


  describe('subscribeToPushNotifications', () => {
    beforeEach(() => {
      jest.spyOn(PushNotifications, 'register').mockResolvedValue();
      jest.spyOn(PushNotifications, 'initialize');
      jest.spyOn(Notification, 'notifyError');
      jest.spyOn(Notification, 'notify');
      Notification.setNotificationComponent({
        show: jest.fn(),
      });
      setRegistered(false);
    });
    afterEach(() => {
      (PushNotifications.register as jest.Mock).mockRestore();
      (PushNotifications.initialize as jest.Mock).mockRestore();
      (Notification.notifyError as jest.Mock).mockRestore();
      (Notification.notify as jest.Mock).mockRestore();
    });


    describe('Registration success', () => {
      it('should subscribe if a device is not registered', async () => {
        await store.dispatch(actions.subscribeToPushNotifications());
        expect(PushNotifications.register).toHaveBeenCalled();
        expect(PushNotifications.initialize).toHaveBeenCalled();
      });

      it('should not subscribe, but initialize if a device is already registered', async () => {
        setRegistered(true);
        await store.dispatch(actions.subscribeToPushNotifications());
        expect(PushNotifications.register).not.toHaveBeenCalled();
        expect(PushNotifications.initialize).toHaveBeenCalled();
      });
    });


    describe('Registration error', () => {
      const registrationErrorMock = new Error('Registration failed');
      beforeEach(() => {
        jest.spyOn(log, 'warn');
      });

      it('should not initialize if registration failed', async () => {
        setRegistrationThrow();
        await store.dispatch(actions.subscribeToPushNotifications());
        expect(PushNotifications.register).toHaveBeenCalled();
        expect(PushNotifications.initialize).not.toHaveBeenCalled();
      });

      it('should show error screen if registration failed', async () => {
        setRegistrationThrow();
        await store.dispatch(actions.subscribeToPushNotifications());
        expect(Notification.notifyError).toHaveBeenCalledWith(
          registrationErrorMock,
        );
      });

      it('should not initialize if a registration service returns error', async () => {
        setRegistrationServiceReturnError();
        await store.dispatch(actions.subscribeToPushNotifications());
        expect(PushNotifications.register).toHaveBeenCalled();
        expect(PushNotifications.initialize).not.toHaveBeenCalled();
      });

      it('should log error and should not show error screen if a registration service returns error', async () => {
        setRegistrationServiceReturnError();
        await store.dispatch(actions.subscribeToPushNotifications());
        expect(Notification.notifyError).toHaveBeenCalledWith(
          registrationErrorMock,
        );
      });

      function setRegistrationThrow() {
        jest
          .spyOn(PushNotifications, 'register')
          .mockReturnValue(Promise.reject(registrationErrorMock));
      }

      function setRegistrationServiceReturnError() {
        jest
          .spyOn(PushNotifications, 'register')
          .mockReturnValue(Promise.reject(registrationErrorMock));
      }
    });
  });


  describe('removeAccountOrLogOut', () => {
    afterEach(() => {
      (PushNotifications.unregister as jest.Mock).mockReset();
      (appStateMock.auth?.logOut as jest.Mock)?.mockReset?.();
    });
    let auth: OAuth2;
    beforeEach(() => {
      jest.spyOn(PushNotifications, 'unregister').mockResolvedValueOnce({});
      updateStore({
        app: {...appStateMock, otherAccounts: []},
      });
      auth = appStateMock.auth as OAuth2;
    });

    it('should logout from the only account', async () => {
      jest.spyOn(auth, 'logOut');
      await store.dispatch(actions.removeAccountOrLogOut());

      expect(auth.logOut).toHaveBeenCalled();
    });

    it('should logout from the current account and switch to another one', async () => {
      const otherAccountMock = {authParamsKey: '123', config: {...appConfigMock, authParams: authParamsMock}};
      updateStore({
        app: {...appStateMock, otherAccounts: [otherAccountMock]},
      });
      jest.spyOn(actions, 'changeAccount');
      jest.spyOn(auth, 'logOut');

      await store.dispatch(actions.removeAccountOrLogOut());

      expect(auth.logOut).toHaveBeenCalled();
      expect(apiMock.user.logout).toHaveBeenCalled();
      expect(store.getActions()[1]).toEqual({type: types.BEGIN_ACCOUNT_CHANGE});
    });

    it('should not unsubscribe from push notifications', async () => {
      setRegistered(false);
      await store.dispatch(actions.removeAccountOrLogOut());

      expect(PushNotifications.unregister).not.toHaveBeenCalled();
    });

    it('should unsubscribe from push notifications', async () => {
      setRegistered(true);
      await store.dispatch(actions.removeAccountOrLogOut());

      expect(PushNotifications.unregister).toHaveBeenCalled();
    });
  });


  describe('Permissions', () => {
    let actualPermissionsMock;
    let cachedPermissionsMock: PermissionCacheItem[];
    let permissionItemMock;
    beforeEach(() => {
      permissionItemMock = {
        permission: {
          key: 'permissionName',
        },
      };
      cachedPermissionsMock = [permissionItemMock];
      actualPermissionsMock = [permissionItemMock, permissionItemMock];
      setStoreAndCurrentUser();
      jest
        .spyOn(permissionsHelper, 'loadPermissions')
        .mockResolvedValueOnce(actualPermissionsMock);
    });

    it('should load permissions', async () => {
      await store.dispatch(actions.loadUserPermissions());
      expect(permissionsHelper.loadPermissions).toHaveBeenCalledWith(
        authParamsMock.token_type,
        authParamsMock.access_token,
        appStateMock.auth.PERMISSIONS_CACHE_URL,
      );
      expect(storage.getStorageState().permissions).toEqual(
        actualPermissionsMock,
      );
    });

    it('should not set permissions from cache if there are no any', async () => {
      setCachedPermissions(null);
      await store.dispatch(actions.loadUserPermissions());
      const storeAction = store.getActions();
      expect(storeAction).toHaveLength(1);
      expect(storeAction[0]).toEqual({
        type: types.SET_PERMISSIONS,
        permissionsStore: new PermissionsStore(actualPermissionsMock),
        currentUser: appStateMock.auth.currentUser,
      });
    });

    it('should update permissions', async () => {
      setCachedPermissions(cachedPermissionsMock);
      await store.dispatch(actions.loadUserPermissions());
      expect(store.getActions()[0]).toEqual({
        type: types.SET_PERMISSIONS,
        permissionsStore: new PermissionsStore(actualPermissionsMock),
        currentUser: appStateMock.auth.currentUser,
      });
    });

    it('should update permissions cache', async () => {
      jest.spyOn(appActionHelper, 'updateCachedPermissions');
      await store.dispatch(actions.loadUserPermissions());
      expect(appActionHelper.updateCachedPermissions).toHaveBeenCalledWith(
        actualPermissionsMock,
      );
    });

    function setCachedPermissions(permissions) {
      storage.__setStorageState({
        permissions: permissions,
      });
    }
  });


  describe('setYTCurrentUser', () => {
    let currentUserMock;
    beforeEach(() => {
      currentUserMock = {};
      storage.__setStorageState({
        currentUser: currentUserMock,
      });

      userMock = mocks.createUserMock();
    });
    it('should set user and cache it', async () => {
      await store.dispatch(actions.setYTCurrentUser(userMock));

      expect(store.getActions()[0]).toEqual({
        type: types.RECEIVE_USER,
        user: userMock,
      });
      expect(storage.getStorageState().currentUser).toEqual({
        ...currentUserMock,
        ytCurrentUser: userMock,
      });
    });
  });

  const searchContextMock = {
    id: 1,
  };
  const naturalCommentsOrderMock = false;


  describe('initializeApp', () => {
    beforeEach(() => {
      setStoreAndCurrentUser({});
    });

    it('should initialize OAuth instance', async () => {
      await store.dispatch(actions.initializeAuth(appConfigMock));
      const storeActions = store.getActions();

      expect(storeActions[0].type).toEqual(types.INITIALIZE_AUTH);
      expect(storeActions[0].auth instanceof OAuth2).toEqual(true);
    });

    it('should redirect to a Login screen if there is any AuthParams in a cache stored', async () => {
      jest
        .spyOn(storageOauth, 'getStoredSecurelyAuthParams')
        .mockResolvedValue(null);
      Router.LogIn = jest.fn();
      await store.dispatch(actions.initializeApp(appConfigMock));

      expect(Router.LogIn).toHaveBeenCalledWith({config: appConfigMock, errorMessage: expect.any(String)});
    });

    it('should set permissions from cache', async () => {
      mockInitialRequests();
      setStorageData({permissions: [{permission: {key: 'permKey'}}]});
      mockGetAuthParamsFromCache();

      await store.dispatch(actions.initializeApp(appConfigMock));
      const action = store.getActions();

      expect(action[0]).toEqual({
        type: types.SET_PERMISSIONS,
        permissionsStore: expect.any(PermissionsStore),
        currentUser: expect.any(Object),
      });
    });

    it('should set a current user from cache', async () => {
      mockGetAuthParamsFromCache();
      const ytCurrentUserMock = mocks.createUserMock({
        id: 2,
        profiles: {
          general: {
            searchContext: searchContextMock,
          },
          appearance: {
            naturalCommentsOrder: naturalCommentsOrderMock,
          },
        },
      });
      setStorageData({currentUser: {ytCurrentUser: ytCurrentUserMock}});
      await store.dispatch(actions.initializeApp(appConfigMock));

      expect(store.getActions()[0]).toEqual({
        type: types.RECEIVE_USER,
        user: ytCurrentUserMock,
      });
    });

    function mockInitialRequests() {
      fetchMock.mock(`${backendURLMock}/api/config?fields=ring(url,serviceId),mobile(serviceSecret,serviceId),version,build,statisticsEnabled,l10n(language,locale)`, {
        mobile: {serviceId: 'youtrack'},
        ring: {
          serviceId: 'id',
          url: '/',
        },
      });
      fetchMock.mock(`${backendURLMock}/hub/api/rest/permissions/cache?query=service%3A%7B0-0-0-0-0%7D%20or%20service%3A%7B%7D&fields=permission%2Fkey%2Cglobal%2Cprojects%28id%29`, {});
      fetchMock.mock(`${backendURLMock}/api/userNotifications/subscribe?fields=token&$top=-1`, {});
    }
  });


  describe('completeInitialization', () => {
    beforeEach(() => {
      setAppStateNetworkConnected(true);
      const foldersMock = createInboxFoldersMock();
      (apiMock.inbox.getFolders as jest.Mock).mockResolvedValue(foldersMock);
    });

    it('should check for inbox thread update', async () => {
      jest.spyOn(feature, 'checkVersion').mockReturnValueOnce(true);

      await store.dispatch(actions.completeInitialization());
      expect(apiMock.inbox.getFolders).toHaveBeenCalled();
    });

    it('should not check for inbox thread update', async () => {
      jest.spyOn(feature, 'checkVersion').mockReturnValueOnce(false);
      await store.dispatch(actions.completeInitialization());
      expect(apiMock.inbox.getFolders).not.toHaveBeenCalled();
    });
  });


  describe('inboxCheckUpdateStatus', () => {
    let foldersMock;
    beforeEach(() => {
      setAppStateNetworkConnected(true);
      foldersMock = createInboxFoldersMock();
    });

    it('should load inbox thread folders without `start` parameter', async () => {
      mocks.setStorage({
        inboxThreadsCache: {
          [folderIdAllKey]: [],
        },
      });
      await store.dispatch(actions.inboxCheckUpdateStatus());
      expect(apiMock.inbox.getFolders).toHaveBeenCalledWith(undefined);
    });

    it('should load inbox thread folders with `start` parameter - a max value from all folders` lasSeen', async () => {
      const notifiedMock = 3;
      mocks.setStorage({
        inboxThreadsCache: {
          [folderIdAllKey]: [
            mocks.createThreadMock({
              notified: notifiedMock,
            }),
            mocks.createThreadMock({
              notified: 2,
            }),
          ],
        },
      });
      await store.dispatch(actions.inboxCheckUpdateStatus());
      expect(apiMock.inbox.getFolders).toHaveBeenCalledWith(notifiedMock + 1);
    });

    it('should set inbox thread folders', async () => {
      apiMock.inbox.getFolders.mockResolvedValueOnce(foldersMock);
      await store.dispatch(actions.inboxCheckUpdateStatus());
      expect(store.getActions()[0]).toEqual({
        type: types.INBOX_THREADS_FOLDERS,
        inboxThreadsFolders: foldersMock,
      });
    });

    it('should not set inbox thread folders on error', async () => {
      apiMock.inbox.getFolders.mockRejectedValueOnce(new Error());
      await store.dispatch(actions.inboxCheckUpdateStatus());
      expect(store.getActions()).toHaveLength(0);
    });
  });

  function createInboxFoldersMock() {
    return [
      {
        id: 'direct',
        lastNotified: 2,
        lastSeen: 1,
      },
      {
        id: 'subscription',
        lastNotified: 1,
        lastSeen: 1,
      },
    ];
  }


  describe('subscribeToURL', () => {
    beforeAll(async () => jest.useFakeTimers({advanceTimers: true}));
    beforeEach(async () => {
      setStoreAndCurrentUser({});
    });

    it('should invoke URL handler', async () => {
      jest.spyOn(urlUtils, 'openByUrlDetector');

      await assert();

      expect(urlUtils.openByUrlDetector).toHaveBeenCalled();
    });


    async function assert(url = '') {
      (Linking.getInitialURL as jest.Mock).mockResolvedValueOnce(url);
      await actions.subscribeToURL()(jest.fn(), store.getState, () => ({} as API));
    }
  });


  function setStoreAndCurrentUser(ytCurrentUser: UserCurrent) {
    updateStore({
      app: {
        auth: createAuthInstanceMock(ytCurrentUser),
      },
    });
    setStorageData({currentUser: {ytCurrentUser}});
  }

  function setStorageData(data: Partial<StorageState>) {
    storage.__setStorageState({...data} as StorageState);
  }

  function setRegistered(isRegistered: boolean) {
    storage.__setStorageState({
      isRegisteredForPush: isRegistered,
    } as StorageState);
  }

  function updateStore(state: Record<string, any> | null | undefined = {}) {
    store = storeMock(state);
  }

  function createAuthInstanceMock(currentUser?: User): OAuth2 {
    appConfigMock = {
      l10n: {
        language: '',
        locale: '',
      },
      build: '',
      backendUrl: backendURLMock,
      statisticsEnabled: true,
      version: '1.1',
      auth: {
        clientId: '',
        serverUri: `${backendURLMock}/hub`,
        landingUrl: '',
        scopes: '',
        youtrackServiceId: '',
      },
    } as AppConfig;
    const authMock = new OAuth2(appConfigMock as AppConfig);
    authParamsMock = {
      token_type: 'token_type',
      access_token: 'access_token',
    } as AuthParams;
    authMock.setAuthParams(authParamsMock as AuthParams);
    if (currentUser) {
      authMock.setCurrentUser(currentUser);
    }
    return authMock;
  }

  function createAPIMock(): API {
    return {
      getUserAgreement: jest.fn().mockResolvedValue({}),
      user: {
        getUser: jest.fn().mockResolvedValue({}),
        getUserFolders: jest.fn().mockResolvedValue([{}]),
        logout: jest.fn().mockResolvedValue([{}]),
      },
      inbox: {
        getFolders: jest.fn().mockResolvedValue([]),
      },
    };
  }

  function setAppStateNetworkConnected(isConnected = true) {
    updateStore({
      app: {
        ...appStateMock,
        networkState: {
          isConnected,
        },
      },
    });
  }

  function mockGetAuthParamsFromCache() {
    jest
      .spyOn(storageOauth, 'getStoredSecurelyAuthParams')
      .mockResolvedValue(authParamsMock);
  }
});
