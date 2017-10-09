class PortfolioDetailCtrl {
  static get $inject() {
    return ['UserModel', 'ShareDataService'];
  }

  constructor(
    UserModel, ShareDataService
  ) {
    this.UserModel = UserModel;
    this.data = ShareDataService.getAssetAllocation().report.analysis;
    this.assetCodeList = [
      'PUBLIC_FUNDS', 'FIXED_INCOME', 'PRIVATE_EQUITY',
      'PRIVATE_PROPERTY', 'PRIVATE_EQUITY_SECURITIES', 'FINANCIAL_MANAGEMENT', 'EDUCATION_PROPERTY'
    ];
    this.isNotApplicable = (assetCode) => (assetCode == 'EDUCATION_PROPERTY');
  }

}

const options = {
  controller: PortfolioDetailCtrl,
  templateUrl: 'pages/crm/portfolio-detail.html',
};

export default options;
