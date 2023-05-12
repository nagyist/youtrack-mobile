import Router from './router';
import {routeMap} from 'app-routes';


describe('Router', () => {
  it('should exists', () => {
    expect(Router).toBeTruthy();
  });

  it('should provide API', () => {
    Object.keys(routeMap).concat([
      'onBack',
      'pop',
      'rootRoutes',
      'navigateToDefaultRoute',
      'setOnDispatchCallback',
    ]).forEach((routeName: string) => {
      expect(Router[routeName]).toBeTruthy();
    });
  });
});
