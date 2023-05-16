import Router from './router';
import {routeMap} from 'app-routes';
import {Navigators} from 'components/navigation';


describe('Router', () => {
  it('should exists', () => {
    expect(Router).toBeTruthy();
  });

  it('should provide API', () => {
    Object.keys(routeMap).concat([
      'doNavigate',
      'pop',
      'rootRoutes',
      'getLastRouteByNavigatorKey',
      'navigateToDefaultRoute',
    ]).forEach((routeName: string) => {
      expect(Router[routeName]).toBeTruthy();
    });
  });

  it('should store native stacks routing data', () => {
    Object.keys(Navigators).forEach((routeName: string) => {
      expect(Router[routeName as keyof Navigators]).toBeTruthy();
    });
  });
});
