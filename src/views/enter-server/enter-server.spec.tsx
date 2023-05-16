import React from 'react';

import {fireEvent, render, waitFor} from '@testing-library/react-native';

import * as appActions from 'actions/app-actions';
import EnterServer from './enter-server';
import {DEFAULT_THEME} from 'components/theme/theme';
import {ThemeContext} from 'components/theme/theme-context';


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
      expect(getByTestId('test:id/enterServerBackButton')).toBeTruthy();
      expect(getByTestId('test:id/server-url')).toBeTruthy();
      expect(getByTestId('test:id/enterServerHint')).toBeTruthy();
      expect(getByTestId('test:id/next')).toBeTruthy();
      expect(getByTestId('test:id/enterServerHint')).toBeTruthy();
      expect(getByTestId('test:id/enterServerHelpLink')).toBeTruthy();
    });
  });


  describe('Connect to a server', () => {
    it('should connect to server', async () => {
      const {getByTestId} = doRender(serverUrl);
      fireEvent.press(getByTestId('test:id/next'));

      await waitFor(() => {
        expect(appActions.connectToNewYoutrack).toHaveBeenCalledWith(serverUrl);
      });
    });

    it('should add protocol for entered URL', async () => {
      const urlNoProtocol: string = serverUrl.slice(7);
      const {getByTestId} = doRender(urlNoProtocol);
      fireEvent.press(getByTestId('test:id/next'));

      await waitFor(() => {
        expect(appActions.connectToNewYoutrack).toHaveBeenCalledWith(`https://${urlNoProtocol}`);
      });
    });

    it('should replace HTTP with HTTPS for a cloud instance', () => {
      const {getByTestId} = doRender('http://foo.myjetbrains.com');
      fireEvent.press(getByTestId('test:id/next'));
      expect(appActions.connectToNewYoutrack).toHaveBeenCalledWith(
        'https://foo.myjetbrains.com',
      );
    });

    it('should trim white spaces', () => {
      const {getByTestId} = doRender('   foo.bar ');
      fireEvent.press(getByTestId('test:id/next'));
      expect(appActions.connectToNewYoutrack).toHaveBeenCalledWith('https://foo.bar');
    });

    it('should remove tailing slash from URL', () => {
      const {getByTestId} = doRender('http://foo.bar/');
      fireEvent.press(getByTestId('test:id/next'));
      expect(appActions.connectToNewYoutrack).toHaveBeenCalledWith('http://foo.bar');
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

      await expect(appActions.connectToNewYoutrack).toHaveBeenCalledWith('http://foo.bar');
      await expect(appActions.connectToNewYoutrack).toHaveBeenCalledWith('http://foo.bar/youtrack');
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

      await expect(appActions.connectToNewYoutrack).toHaveBeenCalledWith('https://foo.bar');
      await expect(appActions.connectToNewYoutrack).toHaveBeenCalledWith('https://foo.bar/youtrack',);
      await expect(appActions.connectToNewYoutrack).toHaveBeenCalledWith('http://foo.bar');
      await expect(appActions.connectToNewYoutrack).toHaveBeenCalledWith('http://foo.bar/youtrack');
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

  function doRender(url = '') {
    return render(
      <ThemeContext.Provider
        value={{
          uiTheme: DEFAULT_THEME,
        }}
      >
        <EnterServer serverUrl={url}/>
      </ThemeContext.Provider>,
    );
  }

});
