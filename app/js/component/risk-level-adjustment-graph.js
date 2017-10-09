let g_riskalyze = null

class Controller {
    static get $inject() {
        return [
            '$log', '$stateParams', '$scope',
            'FinanceModel'
        ];
    }

    constructor(
        $log, $stateParams, $scope,
        FinanceModel
    ) {
        this.$log = $log;
        this.$scope = $scope;

        if (g_riskalyze == null) {
            FinanceModel.fetchRiskalyzeSchema().then((result) => {
              this.riskalyze = g_riskalyze = {
              'ONE_YEAR': result.data.data['1'],
              'THREE_YEARS': result.data.data['3'],
              'FIVE_YEARS': result.data.data['5'],
            };
        });

        } else {
            this.riskalyze = g_riskalyze
        }


        this.setupHooks();
    }

    getWin() {
        if (this.riskalyze) {
            const data = this.riskalyze[this.year][this.riskLevel - 1].win;
            if (this.amount) {
                return {
                    deltaPct: data[0],
                    p: data[1] / 100,
                    pXBase: 266,
                    pXLen: data[1] / 100 * 120,
                    delta: (data[0] / 100) * this.amount,
                };
            }
        }
        return {
            deltaPct: 0,
            p: 0,
            delta: 0,
        };
    }

    getLoss() {
        if (this.riskalyze) {
            const data = this.riskalyze[this.year][this.riskLevel - 1].loss;
            if (this.amount) {
                return {
                    deltaPct: Math.abs(data[0]),
                    p: data[1] / 100,
                    pXBase: 130,
                    pXLen: data[1] / 100 * 120,
                    delta: Math.abs((data[0] / 100) * this.amount),
                };
            }
        }
        return {
            deltaPct: 0,
            p: 0,
            delta: 0,
        }
    }

    setupHooks() {

    }
}

const component = {
    templateUrl: 'component/risk-level-adjustment-graph.html',
    controller: Controller,
    controllerAs: 'vm',
    bindings: {
        riskLevel: '=',
        amount: '<',
        year: '<',
    },
};

export default component;
