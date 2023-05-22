import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';

import Accounts from './accounts';
import Router from 'components/router/router';
import {__setStorageState} from 'components/storage/storage';
import {DEFAULT_THEME} from 'components/theme/theme';

describe('<Accounts/>', () => {
  createAccountMock.id = null;
  let onChangeAccountMock;
  let onLogOutMock;
  let accountsMock;

  beforeEach(() => {
    onChangeAccountMock = jest.fn().mockReturnValue({});
    onLogOutMock = jest.fn();
    __setStorageState(createAccountMock('http://server.org'));
    accountsMock = [createAccountMock(), createAccountMock()];
  });


  describe('Account', () => {
    it('should add new account', () => {
      Router.EnterServer = jest.fn();
      const {getByTestId} = doRender({
        isChangingAccount: false,
      });

      fireEvent.press(getByTestId('test:id/accountsAddAccount'));

      expect(Router.EnterServer).toHaveBeenCalled();
    });

    it('should not add new account', () => {
      Router.EnterServer = jest.fn();
      const {getByTestId} = doRender({
        isChangingAccount: true,
      });

      const addAccountButton = getByTestId('test:id/accountsAddAccount');
      fireEvent.press(addAccountButton);

      expect(Router.EnterServer).not.toHaveBeenCalled();
    });
  });


  describe('Render', () => {
    it('should render component', () => {
      const {getByTestId} = doRender({
        otherAccounts: accountsMock,
      });

      expect(getByTestId('accounts')).toBeTruthy();
      expect(getByTestId('test:id/accountsOnLogOut')).toBeTruthy();
    });

    it('should render all accounts', () => {
      const {getAllByTestId} = doRender({
        otherAccounts: accountsMock,
      });

      expect(getAllByTestId('test:id/accountsAccount')).toHaveLength(3);
    });

    it('should not render accounts without `config`', () => {
      const {getAllByTestId} = doRender({
        otherAccounts: [{}],
      });

      expect(getAllByTestId('test:id/accountsAccount')).toHaveLength(1);
    });
  });

  function createAccountMock(backendUrl = 'https://youtrack.com') {
    if (!createAccountMock.id) {
      createAccountMock.id = 0;
    }

    return {
      creationTimestamp: ++createAccountMock.id,
      config: {
        backendUrl: backendUrl,
      },
      currentUser: {
        id: 'user',
      },
    };
  }


  function doRender({
    isChangingAccount = false,
    openDebugView = () => null,
    otherAccounts = [],
    onChangeAccount = onChangeAccountMock,
    onLogOut = onLogOutMock,
  } = {}) {
    return render(
      <Accounts
        isChangingAccount={isChangingAccount}
        openDebugView={openDebugView}
        otherAccounts={otherAccounts}
        onChangeAccount={onChangeAccount}
        onLogOut={onLogOut}
        uiTheme={DEFAULT_THEME}
      />,
    );
  }
});
