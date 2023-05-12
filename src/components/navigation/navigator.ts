import { createNavigationContainerRef, NavigationContainerRefWithCurrent } from '@react-navigation/native';

import {NavigationRootNames} from 'components/navigation/index';

type NavigationOptions = Record<any, any>;

const navigationRef: NavigationContainerRefWithCurrent<{}> = createNavigationContainerRef();

const navigate = (routeName: NavigationRootNames, options?: NavigationOptions) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(routeName, options);
  }
};

function goBack() {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
}


export {
  goBack,
  navigate,
  navigationRef,
};

