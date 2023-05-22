import React from 'react';

import {fireEvent, render, waitFor} from '@testing-library/react-native';

import * as appActions from 'actions/app-actions';
import * as navigator from 'components/navigation/navigator';
import EnterServer from './enter-server';
import {DEFAULT_THEME} from 'components/theme/theme';
import {ThemeContext} from 'components/theme/theme-context';
import {StorageState} from 'components/storage/storage';


const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

const serverUrl = 'http://example.com';
describe('EnterServer', () => {
  beforeEach(() => {
    jest.spyOn(appActions, 'connectToNewYoutrack');
  });


  describe('Render', () => {
    it('should render screen', () => {
      const {getByTestId} = doRender();
      expect(getByTestId('test:id/enterServer')).toBeTruthy();
      expect(getByTestId('test:id/server-url')).toBeTruthy();
      expect(getByTestId('test:id/enterServerHint')).toBeTruthy();
      expect(getByTestId('test:id/next')).toBeTruthy();
      expect(getByTestId('test:id/enterServerHint')).toBeTruthy();
      expect(getByTestId('test:id/enterServerHelpLink')).toBeTruthy();
    });

    it('should render back button', () => {
      jest.spyOn(navigator, 'canGoBack').mockReturnValueOnce(true);
      const {getByTestId} = doRender();

      expect(getByTestId('test:id/enterServerBackButton')).toBeTruthy();
    });
  });


  describe('Connect to a server', () => {
    it('should connect to some server', async () => {
      const {getByTestId} = doRender(serverUrl);
      fireEvent.press(getByTestId('test:id/next'));

      await waitFor(() => {
        expect(appActions.connectToNewYoutrack).toHaveBeenCalledWith(serverUrl, undefined);
      });
    });

    it('should connect to server and show back button', async () => {
      const accountMock = {};
      const {getByTestId} = doRender(serverUrl, accountMock);
      fireEvent.press(getByTestId('test:id/next'));

      await waitFor(() => {
        expect(appActions.connectToNewYoutrack).toHaveBeenCalledWith(serverUrl, accountMock);
      });
    });

    it('should add protocol for entered URL', async () => {
      const urlNoProtocol: string = serverUrl.slice(7);
      const {getByTestId} = doRender(urlNoProtocol);
      fireEvent.press(getByTestId('test:id/next'));

      await waitFor(() => {
        expect(appActions.connectToNewYoutrack).toHaveBeenCalledWith(`https://${urlNoProtocol}`, undefined);
      });
    });

    it('should replace HTTP with HTTPS for a cloud instance', () => {
      const {getByTestId} = doRender('http://foo.myjetbrains.com');
      fireEvent.press(getByTestId('test:id/next'));
      expect(appActions.connectToNewYoutrack).toHaveBeenCalledWith(
        'https://foo.myjetbrains.com',
        undefined
      );
    });

    it('should trim white spaces', () => {
      const {getByTestId} = doRender('   foo.bar ');
      fireEvent.press(getByTestId('test:id/next'));
      expect(appActions.connectToNewYoutrack).toHaveBeenCalledWith('https://foo.bar', undefined);
    });

    it('should remove tailing slash from URL', () => {
      const {getByTestId} = doRender('http://foo.bar/');
      fireEvent.press(getByTestId('test:id/next'));
      expect(appActions.connectToNewYoutrack).toHaveBeenCalledWith('http://foo.bar', undefined);
    });

    it('should try next URL on failure if protocol is entered', async () => {
      appActions.connectToNewYoutrack.mockImplementationOnce((url: string) => {
        if (!url.includes('youtrack') || url.includes('https://')) {
          throw ('Server is not exist');
        }
        return Promise.resolve();
      });

      const {getByTestId} = doRender('http://foo.bar/');
      fireEvent.press(getByTestId('test:id/next'));

      await expect(appActions.connectToNewYoutrack).toHaveBeenCalledWith('http://foo.bar', undefined);
      await expect(appActions.connectToNewYoutrack).toHaveBeenCalledWith('http://foo.bar/youtrack', undefined);
    });

    it('should try next URL on failure if no protocol entered', async () => {
      appActions.connectToNewYoutrack.mockImplementationOnce((url: string) => {
        if (!url.includes('youtrack') || url.includes('https://')) {
          throw 'Server is not exist';
        }
        return Promise.resolve();
      });
      const {getByTestId} = doRender('foo.bar');
      fireEvent.press(getByTestId('test:id/next'));

      await expect(appActions.connectToNewYoutrack).toHaveBeenCalledWith('https://foo.bar', undefined);
      await expect(appActions.connectToNewYoutrack).toHaveBeenCalledWith('https://foo.bar/youtrack', undefined);
      await expect(appActions.connectToNewYoutrack).toHaveBeenCalledWith('http://foo.bar', undefined);
      await expect(appActions.connectToNewYoutrack).toHaveBeenCalledWith('http://foo.bar/youtrack', undefined);
    });
  });


  describe('onApplyServerUrlChange', () => {
    it('should throw `Incompatible` error', async () => {
      const incompatibleError = {
        isIncompatibleYouTrackError: true,
        message: 'Incompatible youtrack',
      };

      appActions.connectToNewYoutrack.mockImplementationOnce(() => {
        throw incompatibleError;
      });

      const {getByTestId, findByText} = doRender(serverUrl);
      fireEvent.changeText(getByTestId('test:id/server-url'), 'foo.bar');
      fireEvent.press(getByTestId('test:id/next'));

      expect(findByText(incompatibleError.message)).toBeTruthy();
    });
  });

  function doRender(url = '', account?: Partial<StorageState>) {
    return render(
      <ThemeContext.Provider
        value={{
          uiTheme: DEFAULT_THEME,
        }}
      >
        <EnterServer serverUrl={url} currentAccount={account}/>
      </ThemeContext.Provider>,
    );
  }

});
