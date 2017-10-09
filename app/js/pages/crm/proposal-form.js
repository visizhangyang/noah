
class ProposalFormController {
  static get $inject() {
    return [
      '$log', '$q', '$timeout', '$stateParams', '$scope', 'LoadingService',
      'UserModel', 'ProductModel', '$ionicScrollDelegate',
      'FormFactory', 'StateService', 'PortfolioModel', '$ionicHistory'
    ];
  }

  constructor(
    $log, $q, $timeout, $stateParams, $scope, LoadingService,
    UserModel, ProductModel, $ionicScrollDelegate,
    FormFactory, StateService, PortfolioModel, $ionicHistory
  ) {
    this.clientId = $stateParams.id;
    this.portfolioId = $stateParams.portfolioId;
    this.$q = $q;
    this.$log = $log;
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.$ionicScrollDelegate = $ionicScrollDelegate;
    this.LoadingService = LoadingService;
    this.UserModel = UserModel;
    this.ProductModel = ProductModel;
    this.PortfolioModel = PortfolioModel;
    this.StateService = StateService;
    this.$ionicHistory = $ionicHistory
    this.isCompany = false;
    this.pickedCount = 0;
    this.proposalLoaded = false;
    this.productLoaded = false;
    this.tabs = [
      { key: 'FIXED_INCOME', text: '固收类' },
      { key: 'STOCK', text: '股票类' },
      { key: 'ALTERNATIVE', text: '另类投资' },
      { key: 'CASH', text: '现金类' },
    ];
    this.selectedTab = $stateParams.tab || this.tabs[0].key;
    this.formUtil = new FormFactory({
      items: {},
    });
    this.isSubmitting = false;
    this.setupHooks();
  }

  toggleCompany() {
    this.LoadingService.requesting(this.delayedToggle.bind(this));
  }

  delayedToggle() {
    return this.$q((resolve) => {
      this.$timeout(() => {
        this.productsMap = this.getProductsMap();
        this.computeCounts();
        resolve();
      }, 500);
    });
  }

  getProductsMap() {
    let products = _.filter(this.productList, (product) => (
      this.isCompany ? product.company : true
    ));
    products = _.orderBy(products, ['selected']);
    return _.groupBy(products, (i) => i.asset_class);
  }

  setupHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      let request;
      if (this.portfolioId) {
        request = this.PortfolioModel.getPortfolio(this.clientId, this.portfolioId);
      }
      else {
        request = this.UserModel.fetchProposal();
      }

      request = request.then(this.processProposalData.bind(this)).then(this.getList.bind(this));

      this.LoadingService.requesting(() => request);
    });
  }

  processProposalData(resp) {
    this.proposal = resp.data;
    this.total_investment = this.proposal.report.total_investment;
    this.planning_total_investment = Math.round(this.proposal.report.planning_stats.amount);

    const itemList = resp.data.item_list;
    const items = {};
    _.values(itemList).forEach((p) => {
      items[p.product] = {
        amount: p.amount
      };
    });
    this.formUtil.data.items = items;
    this.proposalLoaded = true;
    // this.setupProposalItems();
    this.computeCounts();
  }

  setupProposalItems() {
    if (this.proposalLoaded && this.productLoaded) {
      this.productList.forEach((p) => {
        if (this.formUtil.data.items[p.id]) {
          p.selected = true;
          p.amount = Math.round(this.formUtil.data.items[p.id].amount);
        }
      });
    }
  }

  getList() {
    // const params = {
    //   asset_class: _.map(this.tabs, (i) => i.key).join(','),
    // };
    return this.ProductModel.getList()
      .then((resp) => {
        this.productList = resp.data;
        this.productLoaded = true;
        this.setupProposalItems();
        this.productsMap = this.getProductsMap();
        this.computeCounts();
      });
  }

  adjustAmount(product, isAdd) {
    if (isAdd) {
      if (!product.amount) {
        product.amount = 100
      }
      else {
        product.amount += 100;
      }
    }
    else {
      product.amount = Math.max(product.min_investment, product.amount - 100);
    }

    this.setProductSelected(product);
  }

  changeAmount(product) {
    if (product.amount < 0) {
      product.amount = 0;
    }
    else if (product.amount > this.total_investment) {
      product.amount = this.total_investment;
    }

    this.setProductSelected(product);
  }

  setProductSelected(product) {
    product.selected = !!product.amount;
    this.computeTab(null, this.selectedTab)
  }

  computeCounts() {
    if (!this.productsMap) {
      return;
    }

    this.tabs.forEach((tab) => {
      this.computeTab(tab);
    });
  }

  computeTab(tabObj, key) {
    const tab = tabObj || _.find(this.tabs, (item) => item.key === key);
    if (tab) {
      tab.validCounts = _.filter(
        this.productsMap[tab.key],
        (product) => product.selected
      ).length;
      tab.totalCounts = (this.productsMap[tab.key] || []).length;
    }

    this.pickedCount = this.getItemList().length;
  }

  onSubmit($event, isValid) {
    if (!isValid) {
      this.formUtil.submitError = '请认真填写资产信息';
      return null;
    }

    if (this.isSubmitting) {
      return;
    }

    if (!this.checkInvestments()) {
      return;
    }

    this.isSubmitting = true;
    this.$ionicHistory.removeBackView();

    if (this.portfolioId) {
      return this.PortfolioModel.postPortfolio(this.clientId, this.portfolioId, {
        item_list: this.getItemList(),
      })
        .then(() => {
          this.StateService.forward('portfolioPreview', { clientId: this.clientId, portfolioId: this.portfolioId });
        }, (resp) => this.processSubmitError(resp))
        .finally(() => this.isSubmitting = false);
    }
    else {
      return this.UserModel.postProposal({
        item_list: this.getItemList(),
      }).then(() => {
        this.StateService.forward('proposal', { id: this.clientId });
      }, (resp) => this.processSubmitError(resp))
        .finally(() => this.isSubmitting = false);
    }
  }

  checkInvestments() {
    const products = this.productList.filter((product) => product.selected);

    const invalidProducts = products.filter(product => product.amount < product.min_investment);

    if (invalidProducts.length > 0) {
      const first = invalidProducts[0];
      this.LoadingService.showFailedLoading(`${first.product_name}的起投金额为${first.min_investment}万`, 2500);
      return false;
    }


    const total = _.sumBy(products, function (o) { return o.amount; });

    const error_range = 0; //products.length * 0.5;

    if (total - this.planning_total_investment > error_range) {
      this.LoadingService.showFailedLoading(`产品配置(${total}万)超出计划投资额度(${this.planning_total_investment}万)<br/>请调整计划投资额度或减少部分产品投资额度`, 2500);
      return false;
    } else if (this.planning_total_investment - total > error_range) {
      this.LoadingService.showFailedLoading(`产品配置(${total}万)小于计划投资额度(${this.planning_total_investment}万)<br/>请调整产品配额或增加产品投资`, 2500);
      return false;
    }
    return true;
  }

  processSubmitError(resp) {
    const data = resp.data;

    if (data.error_code === 'portfolio_total_percentage_overflow') {
      data.error_msg = '当前选择的配比大于100%';
    }
    this.formUtil.submitError = data.error_msg;

    if (this.formUtil.submitError) {
      this.$ionicScrollDelegate.scrollBottom();
    }
  }

  getItemList() {
    return this.productList.filter((product) => product.selected)
      .map((product) => ({
        product: product.id,
        amount: product.amount,
        percentage: product.amount / this.total_investment
      }));
  }

  switchTab(tab) {
    this.selectedTab = tab.key;
  }
}

const options = {
  controller: ProposalFormController,
  templateUrl: 'pages/crm/proposal-form.html',
};

export default options;
