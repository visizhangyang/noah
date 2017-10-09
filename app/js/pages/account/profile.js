class AccountProfileCtrl {
  static get $inject() {
    return [
      '$log', '$scope', '$ionicPopup',
      'StateService', 'UserModel', 'RefresherFactory',
    ];
  }
  constructor(
    $log, $scope, $ionicPopup,
    StateService, UserModel, RefresherFactory
  ) {
    this.$log = $log;
    this.$scope = $scope;
    this.$ionicPopup = $ionicPopup;
    this.StateService = StateService;
    this.UserModel = UserModel;

    this.refresher = new RefresherFactory(
      this.refreshFn.bind(this),
      $scope
    );
    this.setHooks();
  }

  setHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.refresher.call();
    });
  }

  refreshFn() {
    return this.UserModel.fetchDetail()
      .then((resp) => {
        const userDetail = resp.data;
        this.renderBody(userDetail);
        return resp;
      });
  }

  renderBody(userDetail) {
    this.user = userDetail;
    this.verifyFailed = userDetail.name_card
                        && userDetail.name_card.status === 'REJECTED';
  }

  logout() {
    this.$ionicPopup.confirm({
      template: '您确定要登出吗 ?',
      buttons: [
        { text: '取消' },
        {
          text: '确定',
          type: 'button-positive',
          onTap: () => {
            this.UserModel.logout(true);
          },
        },
      ],
    });
  }

  pullRefresh() {
    const cb = () => this.$scope.$broadcast('scroll.refreshComplete');
    this.refresher.call(cb.bind(this));
  }
}

const state = {
  name: 'accountProfile',
  options: {
    url: '/account/profile',
    controller: AccountProfileCtrl,
    controllerAs: 'vm',
    templateUrl: 'pages/account/profile.html',
  },
};

export default state;

