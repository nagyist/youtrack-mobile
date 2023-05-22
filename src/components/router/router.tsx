import * as navigator from 'components/navigation/navigator';
import {defaultRootRoute, RootRoutesList, routeMap} from 'app-routes';

import {NavigationParams, NavigationState} from 'react-navigation';
import {INavigationRoute, NavigationRootNames, NavigatorKey, Navigators} from 'components/navigation';

type NavigationRouteState = {
  [key in NavigatorKey]: NavigationState;
}

type NavigationRouteNavigator = {
  [key in NavigationRootNames]: (options?: NavigationParams) => void;
};

interface RouterAPI {
  doNavigate: (routeName: string, options?: NavigationParams) => void;
  getLastRouteByNavigatorKey: (key: NavigatorKey) => INavigationRoute;
  navigateToDefaultRoute: (options?: NavigationParams) => void;
  pop: () => void;
  rootRoutes: typeof RootRoutesList;
}

const doNavigate = (routeName: string, options?: NavigationParams, replace?: boolean) => {
  (replace ? navigator.replace : navigator.navigate)(routeName as NavigationRootNames, options);
};


// @ts-ignore
const Router: RouterAPI & NavigationRouteState & NavigationRouteNavigator = {
  doNavigate,
  pop: navigator.goBack,
  getLastRouteByNavigatorKey: (navigatorKey: NavigatorKey): INavigationRoute => (
    Router?.[navigatorKey]?.routes?.slice?.(-1)?.[0] as INavigationRoute
  ),
  navigateToDefaultRoute: function (options?: NavigationParams) {
    doNavigate(options?.issueId ? routeMap.Issue : defaultRootRoute, options, true);
  },
  rootRoutes: RootRoutesList,
  ...(Object.keys(Navigators).reduce((akk, it) => {
    return ({
      ...akk,
      [it]: {},
    });
  }, {}) as NavigationRouteState),

  ...(Object.keys(routeMap).reduce(function (akk, routeName: string) {
    return {
      ...akk,
      [routeName]: (options?: NavigationParams) => {
        doNavigate(routeName, options);
      },
    };
  }, {}) as NavigationRouteNavigator),
};


export default Router;
