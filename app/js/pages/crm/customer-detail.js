
class CustomerDetailCtrl {
  static get $inject() {
    return [
      '$log', '$stateParams', '$scope',
      'RefresherFactory', 'ClientModel',
      'StateService', 'UserModel'
    ];
  }

  constructor(
    $log, $stateParams, $scope,
    RefresherFactory, ClientModel,
    StateService, UserModel
  ) {
    this.$log = $log;
    this.$scope = $scope;
    this.clientId = $stateParams.id;
    this.ClientModel = ClientModel;
    this.StateService = StateService;
    this.UserModel = UserModel;

    this.refresher = new RefresherFactory(
      this.refreshFn.bind(this),
      $scope
    );
    this.setupHooks();
  }

  setupHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.refresher.call();
    });
  }

  refreshFn() {
    return this.ClientModel.get(this.clientId)
      .then((resp) => {
        this.client = resp.data;
        this.client.status = this.ClientModel.transStatus(resp.data.status);
        this.client.source = this.ClientModel.transSource(resp.data.source);
      }, () => {
        this.StateService.replace('tab.crm');
      });
  }

  onClickOrder(id) {
    this.StateService.forward('orderDetail', { orderId: id });
  }
}

const options = {
  controller: CustomerDetailCtrl,
  templateUrl: 'pages/crm/customer-detail.html',
};
export default options;
