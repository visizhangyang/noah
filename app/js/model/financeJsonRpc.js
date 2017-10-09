
export default class FinanceJsonRpcModel {

  static get $inject() {
    return [
      'JsonRpcUtilFactory'
    ];
  }

  constructor(
    JsonRpcUtilFactory
  ) {
    this.jsonRpcUtil = new JsonRpcUtilFactory();
  }

  fetchRiskalyzeSchema(extRiskLevel) {
    return this.jsonRpcUtil.restfulGet('/api/finance/riskalyze_schema/' + extRiskLevel + '/');
  }

}
