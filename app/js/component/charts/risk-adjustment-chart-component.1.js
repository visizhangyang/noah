const RATIO_MAP = {
    'risk-profile': 'riskRatio',
    'return-profile': 'returnRatio',
    'sharp-profile': 'sharpRatio',
}

class Controller {

    static get $inject() {
        return ['PortfolioModel'];
    }

    constructor(PortfolioModel) {
        this.PortfolioModel = PortfolioModel;
    }

    $onInit() {

        this.line2Label = '资金贡献比';
        this.chartData = null;
        this.chartNegative = false;
        this.rangeBarStopIndex = 0;
        this.rangeBarMaxValue = 0;
        this.buildBaseData();
        this.buildChartData();

        // this.PortfolioModel.getAnalysisData();
    }

    buildBaseData() {
        this.profileOption = this.originData.profileOption;

        if (this.profileOption === 'risk-profile') {
            this.line1Label = '风险贡献比';
            this.rangeBarLeftLabel = '最小风险';
            this.rangeBarRightLabel = '当前风险';
            this.rangeBarMaxValue = this.originData.data.length - 1;
            this.rangeBarStopIndex = this.rangeBarMaxValue;
            this.rangeBarLeftValue = this.originData.data[this.rangeBarMaxValue].risk * 100;
            this.rangeBarRightValue = this.originData.data[0].risk * 100;
        } else if (this.profileOption === 'return-profile') {
            this.line1Label = '收益贡献比';
            this.rangeBarLeftLabel = '当前收益';
            this.rangeBarRightLabel = '最大收益';
            this.rangeBarMaxValue = this.originData.data.length - 1;
            this.rangeBarStopIndex = 0;
            this.rangeBarRightValue = this.originData.data[this.rangeBarMaxValue].annual_rt * 100;
            this.rangeBarLeftValue = this.originData.data[0].annual_rt * 100;
        } else if (this.profileOption === 'sharp-profile') {
            this.line1Label = '产品夏普率';
            this.rangeBarStopIndex = 0;
            this.rangeBarMaxValue = this.originData.data.length - 1;
            // this.rangeBarStopIndex = this.rangeBarMaxValue;
            // this.rangeBarLeftValue = this.originData.data[this.rangeBarMaxValue].annual_rt * 100;
            // this.rangeBarRightValue = this.originData.data[0].annual_rt * 100;
        }
    }

    get isSharpAdjustment() {
        return this.profileOption === 'sharp-profile';
    }

    get canAdjustRiskLevel() {
        return !this.isSharpAdjustment;
    }

    $onChanges() {
        // console.log('$onChanges', props);
        this.buildBaseData();
        this.buildChartData();
    }

    buildChartData() {
        // console.log('buildChartData');

        let index = -1;
        let hasChanged = false;
        let line1Format = percentFormat;
        if (this.profileOption === 'risk-profile') {
            index = this.rangeBarMaxValue - this.rangeBarStopIndex;
            hasChanged = this.rangeBarStopIndex !== this.rangeBarMaxValue;
        } else if (this.profileOption === 'return-profile') {
            index = this.rangeBarStopIndex;
            hasChanged = this.rangeBarStopIndex !== 0;
        } else if (this.profileOption === 'sharp-profile') {
            index = this.rangeBarStopIndex;
            hasChanged = this.rangeBarStopIndex !== 0;
            line1Format = numberFormat;
        }

        const currentState = this.originData.data[index];

        this.chartData = currentState.products.map((p) => {
            return {
                name: p.name,
                line1: p[RATIO_MAP[this.profileOption]],
                line2: p.percentage,
            };
        });

        console.log('this.chartData', this.chartData);

        this.chartData.line1Format = line1Format;

        // console.log('hasChanged', hasChanged);

        this.onChange({
            portfolio_history: currentState.historical_pricing,
            products: hasChanged ? currentState.products : null,
        });
        // console.log('this.chartData', currentState.products);
    }

    isChartNegative() {
        return this.profileOption !== 'risk-profile';
    }

    adjustRisk() {
        this.buildChartData();
    }

    optimizeSharpRatio() {
        if (this.rangeBarStopIndex === 1) return;
        this.rangeBarStopIndex = 1;
        this.adjustRisk();
    }
}

function toFixed(number, digits) {
    return parseFloat(number.toFixed(digits));
}

function percentFormat(v) {
    return Math.round(v * 100) + '%';
}

function numberFormat(v) {
    return (+v).toFixed(2);
}


export default {
    templateUrl: 'component/charts/risk-adjustment-chart-component.html',
    controller: Controller,
    bindings: {
        originData: '<data',
        onChange: '&',
    },
};

// const MOCK_DATA = [{
//     name: '福大环大环大环大环大环大环大环大环大环大环大环大环大环大环球001',
//     line1: 0,
//     line2: 0,
// }, {
//     name: '福大环球002',
//     line1: 0.3,
//     line2: 0.4,
// }, {
//     name: '福大环球003福大环球003',
//     line1: 0.1,
//     line2: -1,
// }, {
//     name: '福大环球004',
//     line1: 0.4,
//     line2: 0.1,
// }, {
//     name: '福大环球005',
//     line1: 0.1,
//     line2: 0.2,
// }];


// name: '福大环球005',
// percentage: 0.1,
// returnRatio: 0.3,
// riskRatio: 0.5,
// sharpRatio: 0.3,