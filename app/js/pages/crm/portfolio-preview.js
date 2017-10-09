class ProposalController {
    static get $inject() {
        return [
            '$log', '$stateParams', '$scope',
            'ClientModel', 'PortfolioModel', 'StateService',
        ];
    }

    constructor(
        $log, $stateParams, $scope,
        ClientModel, PortfolioModel, StateService
    ) {
        this.clientId = $stateParams.clientId;
        this.portfolioId = $stateParams.portfolioId;
        this.$scope = $scope;
        this.ClientModel = ClientModel;
        this.PortfolioModel = PortfolioModel;
        this.StateService = StateService;
        this.hasNext = true;

        this.setupHooks();
    }

    setupHooks() {
        this.$scope.$on('$ionicView.beforeEnter', () => {
            this.PortfolioModel.getPortfolio(this.clientId, this.portfolioId)
                .then((resp) => {
                    this.proposal = resp.data;
                });
        });
    }

    onNext() {
        this.StateService.forward('portfolioPerf', { clientId: this.clientId, portfolioId: this.portfolioId });
    }
}

const options = {
    controller: ProposalController,
    templateUrl: 'pages/crm/portfolio-preview.html',
};

export default options;