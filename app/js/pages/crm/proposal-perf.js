
const orderList = [
  'GLOBAL_STOCK', 'EMERGING_MARKET_EQUITY', 'CHINA_STOCK', 'GLOBAL_BOND',
  'EMERGING_MARKET_BOND', 'ALTERNATIVE', 'P2P', 'CASH',
];

class ProposalPerfController {
  static get $inject() {
    return [
      '$log', '$stateParams', '$scope',
      'ClientModel', 'StateService', 'LoadingService'
    ];
  }

  constructor(
    $log, $stateParams, $scope,
    ClientModel, StateService, LoadingService
  ) {
    this.clientId = $stateParams.id;
    this.$scope = $scope;
    this.ClientModel = ClientModel;
    this.StateService = StateService;
    this.LoadingService = LoadingService;

    this.setupHooks();
  }

  setupHooks() {
    this.$scope.$on('$ionicView.afterEnter', () => {
      this.LoadingService.requesting(this.doFetchProposal.bind(this));
    });
  }

  doFetchProposal() {
    return this.ClientModel.fetchProposal(this.clientId)
      .then((resp) => {
        const groups = this.groups = [];
        if (!resp.data.report.has_one_stats) {
          if (resp.data.report.stats) {
            const stats = resp.data.report.stats;
            groups.push({
              title: `产品定制组合（总资产，金额：${stats.amount.toFixed(0)}万）`,
              stats,
            });
          }
        }

        if (resp.data.report.planning_stats) {
          const stats = resp.data.report.planning_stats;
          groups.push({
            title: `产品定制组合（新购入资产，金额：${stats.amount.toFixed(0)}万）`,
            stats,
          });
        }
      });
  }

  getOrderedKeys(obj) {
    return _.sortBy(_.keys(obj), (k) => orderList.indexOf(k));
  }

  onNext() {
    return this.ClientModel.postBook({
      clientId: this.clientId,
    })
      .then(() => {
        this.StateService.forward('bookList', { clientId: this.clientId });
      });
  }

}

const options = {
  controller: ProposalPerfController,
  templateUrl: 'pages/crm/proposal-perf.html',
};

export default options;
