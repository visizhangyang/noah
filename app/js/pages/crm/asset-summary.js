class AssetCtrl {
    static get $inject() {
        return [
            '$log', '$stateParams', '$scope',
            'StateService',
            'UserModel'
        ];
    }

    constructor(
        $log, $stateParams, $scope,
        StateService,
        UserModel
    ) {
        this.$log = $log;
        // this.clientId = $stateParams.clientId;
        this.$scope = $scope;
        // if (!this.clientId) {
        //     StateService.back('tab.crm');
        //     return;
        // }

        this.UserModel = UserModel;
        this.StateService = StateService;
        this.current_tab = 1;
        this.hasNext = true;

        this.setupHooks();
    }

    setupHooks() {
        this.$scope.$on('$ionicView.beforeEnter', () => {
          this.UserModel.fetchAsset()
            .then((resp) => {
              this.report = resp.data.report;
              this.healthy_status = this.report.healthy_status;
              this.analysis = this.report.analysis;
            });
        });
    }


    changeTab(v) {
        this.current_tab = v;
    }
}

const options = {
    controller: AssetCtrl,
    templateUrl: 'pages/crm/asset-summary.html',
};

export default options;
