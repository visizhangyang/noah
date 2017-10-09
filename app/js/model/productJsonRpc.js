export default class ProductJsonRpcModel {

  static get $inject() {
    return [
      'JsonRpcUtilFactory', 'UserModel'
    ];
  }

  constructor(
    JsonRpcUtilFactory, UserModel
  ) {
    this.jsonRpcUtil = new JsonRpcUtilFactory();
    this.UserModel = UserModel;
  }

  getList(params) {
    return this.UserModel.onSetupReady()
        .then(() => this.jsonRpcUtil.restfulGet('/api/products/').then((res) => {
          return { data: res.data.results };
      }));
  }

}
