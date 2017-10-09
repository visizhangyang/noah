require('./build/templates');
import componentModule from './component/component';
import modelModule from './model/model';
import pagesModule from './pages/pages';
import filterModule from './filter/filter';

import factoryModuleName from './factory/factory';

require('./build/preprocess');

angular.module('unicorn', [
  'ionic',
  'unicorn.templates', 'unicorn.preprocess',
  'ngStorage', 'restangular',
  factoryModuleName,
  componentModule, pagesModule, modelModule, filterModule,
])

  .config([
    '$compileProvider', '$stateProvider', '$urlRouterProvider', '$ionicConfigProvider',
    'isRelease',
    ($compileProvider, $stateProvider, $urlRouterProvider, $ionicConfigProvider,
      isRelease) => {
      $compileProvider.debugInfoEnabled(!isRelease);

      // if none of the above states are matched, use this as the fallback
      // $urlRouterProvider.otherwise('/landing');
      $urlRouterProvider.otherwise('/crm/home');

      $ionicConfigProvider.backButton.text('');
      $ionicConfigProvider.backButton.previousTitleText(false);

      $ionicConfigProvider.spinner.icon('dots');
      $ionicConfigProvider.form.toggle('large');

      $ionicConfigProvider.platform.android
        .scrolling.jsScrolling(true);
      $ionicConfigProvider.platform.android
        .tabs.style('standard').position('bottom');
      $ionicConfigProvider.platform.android
        .navBar.alignTitle('center').positionPrimaryButtons('left');
    },
  ])
  .run(['UserModel', 'LoadingService', (UserModel, LoadingService) => {
    // FIXME: we might need call this inside config part...
    UserModel.checkLogged();
    // UserModel.listenLogout();

    LoadingService.setupHook();
    // const loadingPlaceholder = document.getElementById('loading-placeholder');
    // if (loadingPlaceholder) {
    //   document.getElementById('loading-placeholder').className = '';
    //   document.getElementById('loading-placeholder').setAttribute('height', '0');
    // }
  }]);

if (location.port !== '8100') {
  console.log = console.error = console.info = console.debug = console.warn = () => { }
}
