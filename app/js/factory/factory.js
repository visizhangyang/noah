import StateService from './state-service';
import LoadingService from './loading-service';
import ShareModalService from './share-modal';
import DeviceService from './device-service';
import ApiService from './api-service';
import codeCounterFactory from './code-counter-factory';
import ravenModule from './raven';
import autoUpdateMobule from './autoupdate';
import fileStorageModule from './filestorage';
import permissionMobule from './permission';
import RefresherFactory from './refresher';
import FormFactory from './formFactory';
import WechatService from './wechat';
import JsonRpcMd5Factory from './jsonRpcMd5Factory';
import JsonRpcHttpFactory from './jsonRpcHttpFactory';
import JsonRpcUtilFactory from './jsonRpcUtilFactory';
import ShareDataService from './shareDataService';
import CommonService from './commonService';
import ProgressService from './progress-service';
import PopupService from './popup-service';

const moduleName = 'unicorn.factory';

angular.module(moduleName, [
  'ionic', 'ngStorage',
  ravenModule, autoUpdateMobule, fileStorageModule, permissionMobule
])
  .factory('RefresherFactory', RefresherFactory)
  .factory('FormFactory', FormFactory)
  .factory('codeCounterFactory', codeCounterFactory)
  .service('WechatService', WechatService)
  .service('LoadingService', LoadingService)
  .service('PopupService', PopupService)
  .service('ShareModalService', ShareModalService)
  .service('ApiService', ApiService)
  .service('DeviceService', DeviceService)
  .service('StateService', StateService)
  .factory('JsonRpcMd5Factory', JsonRpcMd5Factory)
  .factory('JsonRpcHttpFactory', JsonRpcHttpFactory)
  .factory('JsonRpcUtilFactory', JsonRpcUtilFactory)
  .service('ShareDataService', ShareDataService)
  .service('ProgressService', ProgressService)
  .service('CommonService', CommonService);

export default moduleName;
