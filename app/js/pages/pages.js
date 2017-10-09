import tabModuleName from './tabs/tabs';
import accountModuleName from './account/account';
import productModule from './products/products';
import articleModule from './articles/articles';
import crmModule from './crm/crm';
import landingPage from './landing/landing';
import loginPage from './landing/login';

const moduleName = 'unicorn.pages';

function Config($stateProvider) {
  $stateProvider.state('landing', _.merge({
    url: '/landing',
    controllerAs: 'vm',
  }, landingPage)).state('login', _.merge({
    url: '/login',
    controllerAs: 'vm',
  }, loginPage));
}

Config.$inject = ['$stateProvider'];

angular.module(moduleName, [
  tabModuleName, accountModuleName, productModule, articleModule,
  crmModule,
])
  .config(Config);

export default moduleName;
