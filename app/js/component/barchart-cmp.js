/** copy from ./proposal-cmp */

const orderList = [
    'FIXED_INCOME', 'STOCK', 'ALTERNATIVE', 'CASH',
];

const MODE = {
    'money': 'money',
    'percentage': 'percentage',
}

class Controller {


    static get $inject() {
        return ['$scope', 'PopupService'];
    }

    constructor($scope, PopupService) {
        this.type = 'default';
        this.data = null;
        this.mode = MODE.money;
        this.popupService = PopupService;
    }

    $onInit() {
    }

    $onChanges(changesObj) {
        if (changesObj.data && changesObj.data.currentValue) {
            this.data = changesObj.data.currentValue;
        }
    }

    changeMode(v) {
        if (this.mode != v) {
            this.mode = v;
        }
    }

    showPropertyDesc() {
        this.popupService.showPropertyDescription();
    }
}

const BarChartCmp = {
    templateUrl: 'component/barchart-cmp.html',
    controller: Controller,
    bindings: {
        data: '<',
        type: '@'
    },
};

export default BarChartCmp;
