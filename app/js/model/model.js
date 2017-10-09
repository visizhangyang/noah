import OrderModel from './order';
import ArticlesModel from './articles';
import AccountModel from './account';
import ClientModel from './client';
import ClientKycModel from './clientKyc';
import PortfolioModel from './portfolio';
import EFModel from './ef';
import KYCModel from './kyc';
import UserJsonRpcModel from './userJsonRpc';
import FinanceJsonRpcModel from './financeJsonRpc';
import ProductJsonRpcModel from './productJsonRpc';

const moduleName = 'unicorn.model';

angular.module(moduleName, ['restangular'])
  .service('ClientKycModel', ClientKycModel)
  .service('KYCModel', KYCModel)
  .service('ArticlesModel', ArticlesModel)
  .service('UserModel', UserJsonRpcModel)
  .service('OrderModel', OrderModel)
  .service('AccountModel', AccountModel)
  .service('ClientModel', ClientModel)
  .service('ProductModel', ProductJsonRpcModel)
  .service('PortfolioModel', PortfolioModel)
  .service('EFModel', EFModel)
  .service('FinanceModel', FinanceJsonRpcModel);

export default moduleName;
