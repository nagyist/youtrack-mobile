import log from 'components/log/log';
import {defaultRootRoute, RootRoutesList, routeMap} from 'app-routes';
import {goBack, navigate, navigationRef} from 'components/navigation/navigator';
import {NavigationRootNames} from 'components/navigation';


import {NavigationParams} from 'react-navigation';

type RouterMethods = {
  [key in NavigationRootNames]: (options?: NavigationParams) => void;
};

interface RouterAPI extends RouterMethods {
  onBack: () => void;
  pop: () => void;
  rootRoutes: typeof RootRoutesList;
  navigateToDefaultRoute: (options?: NavigationParams) => void;
  setOnDispatchCallback: (...args: any[]) => void;
}

const Router: RouterAPI = {
  onBack: goBack,
  pop: goBack,
  rootRoutes: RootRoutesList,
  navigateToDefaultRoute: (options?: NavigationParams) => {
    navigate(options?.issueId ? routeMap.Issue : defaultRootRoute, options);
  },
  setOnDispatchCallback: () => {
    //TODO(route): implement it via RNav
    log.warn('Remove return callback setOnDispatchCallback', navigationRef.getCurrentRoute?.()?.name);
    return () => null;
  },
  ...Object.keys(routeMap).reduce((akk, routeName: string) => {
    return {
      ...akk,
      [routeName]: (options?: NavigationParams) => navigate(routeName as NavigationRootNames, options),
    };
  }, {}),
};


export default Router;
