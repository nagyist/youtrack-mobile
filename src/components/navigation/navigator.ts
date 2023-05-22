import {createNavigationContainerRef, NavigationContainerRefWithCurrent} from '@react-navigation/native';

import {NavigationRootNames} from 'components/navigation';

type NavigationOptions = Record<any, any>;
type NavigateRouteNameParams<P = NavigationRootNames> = P;

const navigationRef: NavigationContainerRefWithCurrent<{}> = createNavigationContainerRef();


const navigate = (routeName: NavigateRouteNameParams<string>, options?: NavigationOptions) => {
  if (navigationRef.isReady()) {
    // @ts-ignore
    navigationRef.navigate(routeName, options);
  }
};

const replace = (routeName: NavigateRouteNameParams<string>, options?: NavigationOptions) => {
  if (navigationRef.isReady()) {
    // @ts-ignore
    navigationRef.navigate(routeName, options);
  }
};

const goBack = () => {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
};

const canGoBack = navigationRef.canGoBack;
const isNavigatorReady = navigationRef.isReady;


export {
  canGoBack,
  goBack,
  isNavigatorReady,
  navigate,
  navigationRef,
  replace,
};
