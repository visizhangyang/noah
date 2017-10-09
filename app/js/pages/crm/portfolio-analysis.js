import moment from 'moment';
import { Map, List } from 'immutable';
import IonicPage from '../ionic-page';

class Page extends IonicPage {

    static get $inject() {
        return ['$scope', '$q', '$stateParams', '$ionicBackdrop', '$ionicPopover', 'ClientModel', 'PortfolioModel', 'StateService'];
    }

    constructor($scope, $q, $stateParams, $ionicBackdrop, $ionicPopover, ClientModel, PortfolioModel, StateService) {
        super($scope);
        this.$q = $q;
        this.$ionicBackdrop = $ionicBackdrop;
        this.$ionicPopover = $ionicPopover;
        this.ClientModel = ClientModel;
        this.clientId = $stateParams.clientId;
        this.PortfolioModel = PortfolioModel;
        this.StateService = StateService;

        this.periodList = [
            { label: '3个月', dateType: 'months', value: 3 },
            { label: '6个月', dateType: 'years', value: 6 },
            { label: '9个月', dateType: 'years', value: 9 },
            { label: '一年', dateType: 'years', value: 1 },
        ];

        this.profileOptionList = [{
            id: 'risk-profile',
            name: '风险贡献',
        }, {
            id: 'return-profile',
            name: '收益贡献',
        }, {
            id: 'sharp-profile',
            name: '夏普率',
        }];

    }

    willEnter() {
        this.profileOptionCurrent = this.profileOptionList[0];
        this.currentPeriod = this.periodList[1];

        this.portfolioHistoryData = Map();

        this.pageCompareState = null;
        this.showProfileOverlay = false;

        this.portfolioList = null;
        this.portfolioCurrent = null;
        this.loadUserPortfolioList();
        // this.compareIndexList = null;
        // this.compareIndexCurrent = null;
        // this.loadIndexList();




        // portfolio products current state if adjustment
        this.portfolioProductsCurrentState = null;
    }

    didEnter() {

    }


    loadUserPortfolioList() {
        this.PortfolioModel.getUserPortfolioList(this.clientId).then(result => {
            this.portfolioList = result.data.results.map(p => {
                return { id: p.id, name: '投资组合' + p.id };
            });
            // this.compareIndexCurrent = this.compareIndexList[0];
            this.choosePortfolioByIndex(0);
            // console.log('this.compareIndexList', this.compareIndexList);
        });
    }


    loadPortfolioData() {
        if (this.portfolioCurrent == null) return this.$q.resolve();
        return this.PortfolioModel.getAnalysisData(this.clientId, this.portfolioCurrent.id, this.startDate).then((result) => {
            this.analysisData = result.data;
            // this.portfolioHistoryData = this.portfolioHistoryData.set('date', result.data.date);
            this.updateProfileChartData();
        });
    }

    selectPeriod(index) {
        if (this.currentPeriod === this.periodList[index]) return this.$q.resolve();
        this.currentPeriod = this.periodList[index];
        const today = moment();
        const startDate = today.subtract(this.currentPeriod.value, this.currentPeriod.dateType);
        this.startDate = startDate.format('YYYY-M-D');
        // this.portfolioHistoryData = this.portfolioHistoryData.set('portfolio', null).set('index', null);
        return this.loadPortfolioData();
    }

    updateProfileChartData() {
        this.profileChartData = {
            profileOption: this.profileOptionCurrent.id,
        };
        if (this.profileOptionCurrent.id === 'risk-profile') {
            this.profileChartData.data = this.analysisData.risk_bar;
        } else if (this.profileOptionCurrent.id === 'return-profile') {
            this.profileChartData.data = this.analysisData.annual_return_bar;
        } else if (this.profileOptionCurrent.id === 'sharp-profile') {
            this.profileChartData.data = this.analysisData.sharpe_tab;
        } else {
            this.profileChartData = null;
        }
        // console.log('this.profileChartData',this.profileChartData);
    }

    /** pageCompareState start */
    choosePortfolio() {
        const state = 'choose-portfolio';
        this.pageCompareState = this.pageCompareState === state ? null : state;
        this.hideProfileOverlay();
    }

    choosePortfolioByIndex(index) {
        // this.hideCompareOverlay();
        if (this.portfolioCurrent === this.portfolioList[index]) return;
        this.portfolioCurrent = this.portfolioList[index];
        return this.loadPortfolioData();
    }

    // chooseCompareIndex() {
    //     const state = 'choose-compare-index';
    //     this.pageCompareState = this.pageCompareState === state ? null : state;
    //     this.hideProfileOverlay();
    // }

    // chooseCompareIndexByIndex(index) {
    //     this.hideCompareOverlay();
    //     if (this.compareIndexCurrent === this.compareIndexList[index]) return;
    //     this.compareIndexCurrent = this.compareIndexList[index];
    //     return this.loadIndexHistoryData();
    // }


    isPageCompareStateChoosePortfolio() {
        return this.pageCompareState === 'choose-portfolio';
    }

    // isPageCompareStateChooseCompareIndex() {
    //     return this.pageCompareState === 'choose-compare-index';
    // }

    // hideCompareOverlay() {
    //     this.pageCompareState = null;
    // }

    /** pageCompareState end */
    /** showProfileOverlay start */

    chooseProfileOption(index) {
        this.hideProfileOverlay();
        if (this.profileOptionCurrent === this.profileOptionList[index]) return;
        this.profileOptionCurrent = this.profileOptionList[index];
        this.updateProfileChartData();
    }

    hideProfileOverlay() {
        this.showProfileOverlay = false;
    }

    // toggleProfileOptions() {
    //     this.showProfileOverlay = !this.showProfileOverlay;
    // }

    /** showProfileOverlay end */

    handleRiskAdjustmentChanged(portfolio_history, products) {
        if (portfolio_history) {
            this.portfolioHistoryData = this.portfolioHistoryData.set('portfolio', { name: this.portfolioCurrent.name, data: portfolio_history });
        }

        this.portfolioProductsCurrentState = products;
        // console.log('products', products);
    }

    save() {
        if (this.portfolioProductsCurrentState == null) return;
        const products = this.portfolioProductsCurrentState.map(p => {
            return {
                product: p.id,
                percentage: p.percentage,
            };
        });
        const today = moment().format('YYYY-M-D');
        return this.PortfolioModel.savePortfolio(this.clientId, products, this.startDate, today).then((resp) => {
            this.gotoPreviewPage(resp.data.id);
        }).catch(() => {

        });
    }

    gotoPreviewPage(portfolio_id) {
        this.StateService.forward('portfolioPreview', { clientId: this.clientId, portfolioId: portfolio_id });
    }
}

export default {
    templateUrl: 'pages/crm/portfolio-analysis.html',
    controller: Page,
}