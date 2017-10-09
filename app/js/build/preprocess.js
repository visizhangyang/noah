import ProductModel from '../model/product';
import UserModel from '../model/user';
import FinanceModel from '../model/finance';

const moduleName = 'unicorn.preprocess';

class SettingsService {
  static get $inject() {
    return [
      '$location',
    ];
  }
  constructor($location) {
    this.$location = $location;

    const isWebView = ionic.Platform.isWebView();
    this.API_BASE_URL = 'https://noah-dev.micaiapp.com/app/';
    this.riskLevelRedirect = '/noah-risk-level-test';
    this.riskLevelRedirectWithNextUrl = 'undefined';
    this.isNativeApp = 'false' === 'true';

    // if in cordova, get path from settings
    if (this.API_BASE_URL && isWebView) {
      //this.baseURL = this.API_BASE_URL.replace(/\/s/, '');
      this.baseURL = this.API_BASE_URL.replace(/\/$/, '');
    } else {
      this.baseURL = this.fallbackPath();
    }
  }

  fallbackPath() {
    const port = this.$location.port();
    const protocol = this.$location.protocol();
    const host = this.$location.host();
    const portPart = port ? `:${port}` : '';

    return `${protocol}://${host}${portPart}`;
  }

  url() {
    return `${this.baseURL}/api/`;
  }

}

angular.module(moduleName, [])
  .constant('isRelease', 'false' === 'true')
  .constant('ravenToken', 'undefined')
  .constant('sentryRelease', 'ce70878b1d5605138a060cba9306700ec6f588a8')
  .service('SettingsService', SettingsService);



if ('true' === 'true') {
  angular.module('unicorn.model')
    .service('UserModel', UserModel)
    .service('FinanceModel', FinanceModel)
    .service('ProductModel', ProductModel);
}
