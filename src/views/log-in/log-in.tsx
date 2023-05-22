import React from 'react';
import {
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  TouchableWithoutFeedback,
} from 'react-native';

import KeyboardSpacer from 'react-native-keyboard-spacer';
import {useDispatch} from 'react-redux';

import clicksToShowCounter from 'components/debug-view/clicks-to-show-counter';
import ErrorMessageInline from 'components/error-message/error-message-inline';
import log from 'components/log/log';
import OAuth2 from 'components/auth/oauth2';
import usage from 'components/usage/usage';
import {ERROR_MESSAGE_DATA} from 'components/error/error-message-data';
import {formatYouTrackURL} from 'components/config/config';
import {formStyles} from 'components/common-styles/form';
import {HIT_SLOP} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';
import {logo, IconBack} from 'components/icon/icon';
import {openDebugView, onLogIn} from 'actions/app-actions';
import {resolveErrorMessage} from 'components/error/error-resolver';
import {routeMap} from 'app-routes';
import {StorageState} from 'components/storage/storage';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './log-in.styles';

import type {AppConfig} from 'types/AppConfig';
import type {OAuthParams2} from 'types/Auth';
import type {CustomError} from 'types/Error';
import type {Theme, UIThemeColors} from 'types/Theme';
import {INavigationParams, mixinNavigationProps} from 'components/navigation';

interface Props extends INavigationParams {
  config: AppConfig;
  onChangeServerUrl: (url: string) => any;
  errorMessage?: string;
  error?: CustomError;
  currentAccount?: StorageState;
}

interface State {
  username: string;
  password: string;
  errorMessage: string;
  loggingIn: boolean;
  youTrackBackendUrl: string;
}


const CATEGORY_NAME = 'Login form';
const logMsg: string = 'Login via browser PKCE';


const LogIn = (props: Props) => {
  const dispatch = useDispatch();
  const passInputRef: React.RefObject<TextInput> = React.useRef(null);
  const {config, navigation} = props;
  const [state, updateState] = React.useState<State>({
    username: '',
    password: '',
    errorMessage: props.errorMessage || '',
    loggingIn: false,
    youTrackBackendUrl: props.config?.backendUrl,
  });

  const setState = (statePartial: Partial<State> | State) => {
    updateState((st: State) => ({...st, ...statePartial}));
  };

  const isConfigHasClientSecret = React.useCallback((): boolean => {
    return !!config?.auth?.clientSecret;
  }, [config?.auth?.clientSecret]);

  const changeYouTrackUrl = React.useCallback(() => {
    const serverUrl: string = props.config.backendUrl;
    if (props?.onChangeServerUrl) {
      props.onChangeServerUrl(serverUrl);
    } else {
      navigation.navigate(routeMap.EnterServer, {serverUrl});
    }
  }, [navigation, props]);

  const logInViaHub = React.useCallback(async () => {
    try {
      setState({loggingIn: true});
      const authParams: OAuthParams2 = await OAuth2.obtainTokenWithOAuthCode(config) as OAuthParams2;
      usage.trackEvent(CATEGORY_NAME, logMsg, 'Success');
      dispatch(onLogIn(authParams, config, props.currentAccount));

    } catch (err) {
      usage.trackEvent(CATEGORY_NAME, logMsg, 'Error');
      log.warn(logMsg, err);

      if (err.code === 'authentication_failed') {
        changeYouTrackUrl();
      } else {
        const errorMessage = await resolveErrorMessage(err);
        setState({
          loggingIn: false,
          errorMessage: errorMessage,
        });
      }
    }
  }, [changeYouTrackUrl, config, dispatch, props.currentAccount]);

  React.useEffect(() => {
    const doLogInViaHub = async () => {
      if (!isConfigHasClientSecret()) {
        await logInViaHub();
      }
    };
    usage.trackScreenView('Login form');
    doLogInViaHub();
  }, [isConfigHasClientSecret, logInViaHub]);

  const logInViaCredentials = async () => {
    const {username, password} = state;
    setState({loggingIn: true});
    try {
      const authParams: OAuthParams2 = await OAuth2.obtainTokenByCredentials(
        username,
        password,
        config,
      ) as OAuthParams2;
      usage.trackEvent(CATEGORY_NAME, 'Login via credentials', 'Success');

      if (!authParams.accessTokenExpirationDate && authParams.expires_in) {
        authParams.accessTokenExpirationDate = Date.now() + authParams.expires_in * 1000;
      }
      onLogIn(authParams);

    } catch (err) {
      usage.trackEvent(CATEGORY_NAME, 'Login via credentials', 'Error');
      const errorMessage: string = ERROR_MESSAGE_DATA[err.error]
        ? ERROR_MESSAGE_DATA[err.error].title
        : err.error_description || err.message;
      setState({
        errorMessage: errorMessage,
        loggingIn: false,
      });
    }
  };

  const {password, username, loggingIn, errorMessage} = state;
  const isLoginWithCreds: boolean = isConfigHasClientSecret();
  return (
    <ThemeContext.Consumer>
      {(theme: Theme) => {
        const uiThemeColors: UIThemeColors = theme.uiTheme.colors;
        const hasNoCredentials: boolean = !username && !password;
        return (
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View
              style={[
                styles.container,
                isLoginWithCreds ? null : styles.loadingContainer,
              ]}
            >
              <View style={styles.backIconButtonContainer}>
                <TouchableOpacity
                  onPress={changeYouTrackUrl}
                  style={styles.backIconButton}
                  testID="back-to-url"
                >
                  <IconBack/>
                </TouchableOpacity>
              </View>

              <View
                style={
                  isLoginWithCreds
                    ? styles.formContent
                    : styles.formContentCenter
                }
              >
                <TouchableWithoutFeedback
                  //TODO: add route
                  onPress={() => clicksToShowCounter(dispatch(openDebugView()))}
                >
                  <Image style={styles.logoImage} source={logo}/>
                </TouchableWithoutFeedback>

                <TouchableOpacity
                  style={styles.formContentText}
                  onPress={changeYouTrackUrl}
                  testID="youtrack-url"
                >
                  <Text style={styles.title}>
                    {i18n('Log in to YouTrack')}
                  </Text>
                  <Text style={styles.hintText}>
                    {formatYouTrackURL(config.backendUrl)}
                  </Text>
                </TouchableOpacity>

                {isLoginWithCreds && (
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loggingIn}
                    testID="test:id/login-input"
                    accessibilityLabel="login-input"
                    accessible={true}
                    style={styles.inputUser}
                    placeholder={i18n('Username or email')}
                    placeholderTextColor={uiThemeColors.$icon}
                    returnKeyType="next"
                    underlineColorAndroid="transparent"
                    onSubmitEditing={() => passInputRef?.current?.focus()}
                    value={username}
                    onChangeText={(username: string) =>
                      setState({
                        username,
                      })
                    }
                  />
                )}

                {isLoginWithCreds && (
                  <TextInput
                    ref={passInputRef}
                    editable={!loggingIn}
                    testID="test:id/password-input"
                    accessibilityLabel="password-input"
                    accessible={true}
                    style={styles.inputPass}
                    placeholder={i18n('Password')}
                    placeholderTextColor={uiThemeColors.$icon}
                    returnKeyType="done"
                    underlineColorAndroid="transparent"
                    value={state.password}
                    onSubmitEditing={() => {
                      logInViaCredentials();
                    }}
                    secureTextEntry={true}
                    onChangeText={(password: string) =>
                      setState({
                        password,
                      })
                    }
                  />
                )}

                {isLoginWithCreds && (
                  <TouchableOpacity
                    style={[
                      formStyles.button,
                      (loggingIn || hasNoCredentials) &&
                      formStyles.buttonDisabled,
                    ]}
                    disabled={loggingIn || hasNoCredentials}
                    testID="test:id/log-in"
                    accessibilityLabel="log-in"
                    accessible={true}
                    onPress={logInViaCredentials}
                  >
                    <Text
                      style={[
                        formStyles.buttonText,
                        hasNoCredentials && formStyles.buttonTextDisabled,
                      ]}
                    >
                      {i18n('Log in')}
                    </Text>
                    {state.loggingIn && (
                      <ActivityIndicator style={styles.progressIndicator}/>
                    )}
                  </TouchableOpacity>
                )}

                {!isLoginWithCreds &&
                  state.loggingIn &&
                  !state.errorMessage && (
                    <View style={styles.loadingMessage}>
                      <ActivityIndicator
                        style={styles.loadingMessageIndicator}
                        color={styles.loadingMessageIndicator.color}
                      />
                    </View>
                  )}

                {isLoginWithCreds && (
                  <Text style={styles.hintText}>
                    {i18n('You need a YouTrack account to use the app.\n')}
                    <Text
                      style={formStyles.link}
                      onPress={() =>
                        Linking.openURL(
                          'https://www.jetbrains.com/company/privacy.html',
                        )
                      }
                    >
                      {i18n(
                        'By logging in, you agree to the Privacy Policy.',
                      )}
                    </Text>
                  </Text>
                )}

                {Boolean(errorMessage || hasNoCredentials) && (
                  <View style={styles.error}>
                    <ErrorMessageInline error={state.errorMessage}/>
                  </View>
                )}
              </View>
              {isLoginWithCreds && (
                <TouchableOpacity
                  hitSlop={HIT_SLOP}
                  style={styles.support}
                  testID="test:id/log-in-via-browser"
                  accessibilityLabel="log-in-via-browser"
                  accessible={true}
                  onPress={() => logInViaHub()}
                >
                  <Text style={styles.action}>
                    {i18n('Log in with Browser')}
                  </Text>
                </TouchableOpacity>
              )}

              <KeyboardSpacer/>
            </View>
          </ScrollView>
        );
      }}
    </ThemeContext.Consumer>
  );
};


export default mixinNavigationProps(LogIn);
