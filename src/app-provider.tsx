import * as React from 'react';
import {StatusBar, View} from 'react-native';

import * as Progress from 'react-native-progress';
import {Host} from 'react-native-portalize';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';

import DebugView from 'components/debug-view/debug-view';
import ErrorBoundary from 'components/error-boundary/error-boundary';
import Navigation from 'components/navigation/navigation';
import Network from 'components/network/network';
import ThemeProvider from 'components/theme/theme-provider';
import UserAgreement from 'components/user-agreement/user-agreement';
import {AppState} from 'reducers';
import {
  buildStyles,
  DEFAULT_THEME,
  getUITheme,
  getThemeMode,
} from 'components/theme/theme';
import {ThemeContext} from 'components/theme/theme-context';


import * as styles from 'components/common-styles';
import stylesProgress from 'components/common-styles/progress';

import type {Theme, UITheme} from 'types/Theme';
import type {ViewStyleProp} from 'types/Internal';


export default function AppProvider() {
  const insets = useSafeAreaInsets();

  const isInProgress: boolean = useSelector((appState: AppState) => !!appState.app.isInProgress);

  const [themeMode, updateThemeMode] = React.useState<string>();

  React.useEffect(() => {
    setTheme();

    async function setTheme() {
      const mode: string = await getThemeMode();
      buildStyles(mode, getUITheme(mode));
      updateThemeMode(mode);
    }
  }, []);


  if (!themeMode) {
    return null;
  }

  return (
    <ThemeProvider mode={themeMode}>
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          const uiTheme: UITheme = theme.uiTheme || DEFAULT_THEME;
          const style: Partial<ViewStyleProp> = {backgroundColor: uiTheme.colors.$background};
          return (
            <>
              <StatusBar
                backgroundColor={style.backgroundColor}
                barStyle={uiTheme.barStyle}
                translucent={true}
              />

              <ErrorBoundary>
                <Host>
                  <View
                    style={{
                      flex: 1,
                      paddingTop: Math.min(insets.top, styles.UNIT * 5),
                      paddingLeft: Math.min(insets.left, styles.UNIT * 4),
                      paddingRight: Math.min(insets.right, styles.UNIT * 4),
                    }}
                  >
                    <UserAgreement/>
                    <DebugView
                      logsStyle={{
                        ...style,
                        textColor: uiTheme.colors.$text,
                        separatorColor: uiTheme.colors.$separator,
                      }}
                    />
                    <View style={stylesProgress.menuProgressContainer}>
                      <Progress.Bar
                        animated={true}
                        indeterminate={true}
                        indeterminateAnimationDuration={1000}
                        useNativeDriver={true}
                        color={isInProgress ? uiTheme.colors.$link : 'transparent'}
                        borderWidth={0}
                        unfilledColor={isInProgress ? uiTheme.colors.$linkLight : 'transparent'}
                        width={null}
                        height={3}
                        borderRadius={0}
                      />
                    </View>
                    <Navigation/>
                  </View>
                </Host>
              </ErrorBoundary>
              <Network/>
            </>
          );
        }}
      </ThemeContext.Consumer>
    </ThemeProvider>
  );
}
