
export default class FinanceModel {
  static get $inject() {
    return [
      'ApiService', 'UserModel'
    ];
  }

  constructor(
    ApiService, UserModel
  ) {
    this.UserModel = UserModel;
    this.ApiService = ApiService;
    this.financeApi = ApiService.authApi.all('finance');
  }

  ready(fn) {
    return this.UserModel.onSetupReady().then(() => fn(this.financeApi));
  }

  fetchRiskalyzeSchema(extRiskLevel) {
    let extRiskLevelStr = new String(extRiskLevel);
    return this.financeApi.all('riskalyze_schema').one(extRiskLevelStr).customGET();
  }

}
