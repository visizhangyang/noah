
export default class UserJsonRpcModel {
  static get $inject() {
    return [
      '$q', 'JsonRpcUtilFactory', 'CommonService'
    ];
  }

  constructor(
    $q, JsonRpcUtilFactory, CommonService
  ) {
    this.setup = $q.defer();
    this.jsonRpcUtil = new JsonRpcUtilFactory();
    this.CommonService = CommonService;
  }

  onSetupReady() {
    return this.setup.promise;
  }

  checkLogged() {
    this.setup.resolve();
  }

  ready(fn) {
    return this.onSetupReady().then(() => fn());
  }

  fetchAsset() {
    const fn = () => this.jsonRpcUtil.restfulGet('/api/users/asset_allocation/');
    return this.ready(fn);
  }

  postAsset(params) {
    const fn = () => this.jsonRpcUtil.restfulPost('/api/users/asset_allocation/', params).then((result) => {
      if (result.data) {
        const fields = ['annual_income', 'annual_expenditure', 'liability', 'monthly_repayment',
          'planning_invest', 'public_funds', 'private_property', 'private_equity_securities', 'private_equity',
          'financial_management', 'fixed_income', 'extra_public_funds', 'extra_private_property',
          'extra_private_equity_securities', 'extra_private_equity', 'extra_financial_management', 'extra_fixed_income',
          'retirement_age', 'children_education_budget', 'annual_cost_after_retirement', 'health_insurance_coverage',
          'life_insurance_coverage', 'risk_level', 'noah_risk_level', 'risk_planning_invest',
          'personal_income_family_income_share', 'inheritance_amount'
        ];
        this.CommonService.convertStringFieldsToInt(result.data, fields);
      }
      return result;
    });
    return this.ready(fn);
  }

  fetchProposal() {
    const fn = () => this.jsonRpcUtil.restfulGet('/api/users/portfolio_proposal/');
    return this.ready(fn);
  }

  postProposal(params) {
    const fn = () => this.jsonRpcUtil.restfulPost('/api/users/portfolio_proposal/', params);
    return this.ready(fn);
  }

  fetchBookList() {
    const fn = () => this.jsonRpcUtil.restfulGet('/api/users/all_proposal_books/');
    return this.ready(fn);
  }

  postBook() {
    const fn = () => this.jsonRpcUtil.restfulPost('/api/users/all_proposal_books/', {});
    return this.ready(fn);
  }

  acceptBook(id, status) {
    const fn = () => this.jsonRpcUtil.restfulPost(`/api/users/proposal_book/${id}/adopt_pdf/${status ? 'true' : 'false'}/`);
    return this.ready(fn);
  }

  generatePdf(bookId) {
    const fn = () => this.jsonRpcUtil.restfulPost('/api/users/all_proposal_books/async_generate_pdf/' + bookId + '/', {});
    return this.ready(fn);
  }

  getBaseInfo() {
    const fn = () => this.jsonRpcUtil.promise('ra.user_base_info');
    return this.ready(fn);
  }

  post(params) {
    const fn = () => this.jsonRpcUtil.restfulPost('/api/users/', params);
    return this.ready(fn);
  }

  fetchYinoTag() {
    const fn = () => this.jsonRpcUtil.restfulGet('/api/noah/YINO_tag_schema/');
    return this.ready(fn);
  }

  fetchPortfolioMain() {
    const fn = () => this.jsonRpcUtil.restfulGet('/api/users/portfolio_proposal/stats/');
    return this.ready(fn);    
  }


}

