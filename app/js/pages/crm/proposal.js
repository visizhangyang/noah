
class ProposalController {
  static get $inject() {
    return [
      '$log', '$stateParams', '$scope',
      'UserModel', 'StateService',
    ];
  }

  constructor(
    $log, $stateParams, $scope,
    UserModel, StateService
  ) {
    this.clientId = $stateParams.id;
    this.$scope = $scope;
    this.UserModel = UserModel;
    this.StateService = StateService;
    this.hasNext = true;

    this.setupHooks();
  }

  setupHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.UserModel.fetchProposal()
        .then((resp) => {
          this.proposal = resp.data;
        });
    });
  }

  onNext() {
    return this.UserModel.postBook()
      .then(() => {
        this.StateService.forward('bookList', { clientId: this.clientId });
      });
  }

}

const options = {
  controller: ProposalController,
  templateUrl: 'pages/crm/proposal.html',
};

export default options;
