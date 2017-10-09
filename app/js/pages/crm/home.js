const OPTION_STATE = {
    SELECT_PERIOD: 1,
    SELECT_RISK_LEVEL: 2,
}

const TABS = {
    ONE: 1,
    TWO: 2,
}

const PTABS = {
    ONE: 1,
    TWO: 2,
}

const PORTFOLIO_STATUS = {
    CURRENT: 'current_status',
    TARGET: 'target_status',
}

const DISPLAY_MODE = {
    MONEY: 'money',
    PERCENTAGE: 'percentage',
}

class HomeCtrl {
    static get $inject() {
        return [
            '$log', '$stateParams', '$scope', '$ionicPopup', '$filter',
            'StateService', 'UserModel', 'LoadingService',
            'KYCModel', 'ShareDataService', 'SettingsService'
        ];
    }

    constructor(
        $log, $stateParams, $scope, $ionicPopup, $filter,
        StateService, UserModel,LoadingService,
        KYCModel, ShareDataService, SettingsService
    ) {
        this.$log = $log;
        // this.clientId = $stateParams.clientId;
        this.$scope = $scope;
        this.$ionicPopup = $ionicPopup;
        this.$filter = $filter;
        // if (!this.clientId) {
        //     StateService.back('tab.crm');
        //     return;
        // }
        this.UserModel = UserModel;
        this.KYCModel = KYCModel;
        this.StateService = StateService;
        this.LoadingService=LoadingService;
        this.shareDataService = ShareDataService;

        this.setupHooks();

        this.profit_map = null;
        this.riskLevelRedirect = SettingsService.riskLevelRedirect;
        this.riskLevelRedirectWithNextUrl = SettingsService.riskLevelRedirectWithNextUrl;
        this.isNativeApp = SettingsService.isNativeApp;
        this.classList = [
        'PUBLIC_FUNDS', 'FIXED_INCOME', 'PRIVATE_EQUITY',
        'PRIVATE_PROPERTY', 'PRIVATE_EQUITY_SECURITIES', 'FINANCIAL_MANAGEMENT', 'EDUCATION_PROPERTY'
        ];
    }

    setupHooks() {
        this.period_list = [{ value: 'ONE_YEAR', name: '1年' }, { value: 'THREE_YEARS', name: '3年' }, { value: 'FIVE_YEARS', name: '5年' }];
        this.period_current = this.period_list[0];
        this.option_state = OPTION_STATE.SELECT_RISK_LEVEL;
        this.current_tab = TABS.TWO;  //目前配置
        this.product_cur_tab = PTABS.ONE; //产品推荐
        this.data = null;
        this.client = null;
        this.allocation = null;
        this.otherInfo = this.shareDataService.getOtherInfo();

        this.$scope.$on('$ionicView.beforeEnter', () => {
            this.planInvestState = 0;
            this.portfolioProposalNewData = null;
            const getUserBaseInfo = this.shareDataService.getUserBaseInfo();
            const riskLevel = getUserBaseInfo.riskLevel;
            if(riskLevel == undefined || riskLevel == null || riskLevel == ''){
                // 加载提醒
                this.LoadingService.requestingShowText('风险等级加载中...');
                // 基本信息
                this.UserModel.getBaseInfo().then((res) => {
                    this.client = res.result;
                    this.shareDataService.setUserBaseInfo(res.result);
                    this.assetAllocationPar(res.result);
                    // 是否做过风测
                    this.isTestRisk();
                    // 目前配置and推荐配置
                    this.postAsset();
                });
            }else{
                this.data = this.shareDataService.assetAllocation;
                this.calcCurrentInvest();
                this.assetsStatus();
                //KYC,重新加载
                console.log(this.otherInfo)
                if(this.otherInfo.backHome == 1){
                    this.fetchProposal();
                    this.otherInfo.backHome = 0;
                }
            }
        });

        this.$scope.$on('portfolioProposal.change', (e, isValid, newData) => {
          this.isPortfolioProposalValid = isValid;
          this.portfolioProposalNewData = newData;
        });
    }

    assetAllocationPar(result){
        this.data = {};
        this.data.noah_risk_level = parseInt(result.riskLevel);
        this.data.noah_client_name = result.realName;
        this.data.advisor_name = result.faName;
        const investorStatusFilter = this.$filter('investorStatus');
        this.data.invest_type = investorStatusFilter(result);
    }

    processProposalResult(res) {
      if(res.data != undefined || res.data != null){
        this.groupsList = res.data.report;
        this.isPortfolioProposalValid = true;
        this.shareDataService.setProcessProposal(res);
        this.originalAssetGroupStr = JSON.stringify(this.groupsList.asset_groups);
      }else{
        this.LoadingService.showFailedLoading("加载失败，请稍等再试")
      }
      this.LoadingService.clean();
    }

    calcCurrentInvest() {
        this.data.planning_invest = parseInt(this.data.planning_invest)
        this.data.current_invest = parseInt(this.data.report.analysis.current_status.total);
    }

    //密度图JSONRPC数据转换
    changeObject(data){
        data.forEach(function(reselt) {
            reselt.forEach(function(res){
                res[2] = res[2].replace(/\"/g, "");
                res[0] = parseInt(res[0]);
                res[1] = parseInt(res[1]);
            },this)
        }, this);
        this.profit_map = data;
    }

    // 配置模块POST
    postAsset(){
        // 加载提醒
        this.LoadingService.requestingShowText('资产配置中...');
        this.UserModel.postAsset(this.data).then((res) => {
            if(res.data != undefined || res.data != null){
                this.data = res.data;
                this.calcCurrentInvest();
                this.assetsStatus();
                this.shareDataService.setAssetAllocation(res.data);
            }else{
                this.LoadingService.showFailedLoading("加载失败，请稍等再试")
            }
        })
    }

    //当前Tab加载
    assetsStatus(){
        if(this.current_tab != 1){
            const processProposal = this.shareDataService.getProcessProposal();
            if(processProposal == undefined || processProposal == null || this.planInvestState == 1){
                this.fetchProposal();
            }else{
                this.processProposalResult(processProposal)
            }
            this.product_cur_tab = PTABS.ONE; //产品推荐
            this.allocation = this.getDonutData('target_status')
        }else{
            this.current_tab = TABS.ONE;
            this.allocation = this.getDonutData('current_status')
        }
    }

    // 是否做过风测（0未做过 1已做过）
    isTestRisk(){
        //新用户
        if(this.client.isTestRisk == 0){
            window.location.href = this.riskLevelRedirect   //评测
        }else{
            //有风测，有/无资产
            this.LoadingService.clean();
        }
    }

    // 产品推荐
    fetchProposal(){
        this.UserModel.fetchProposal().then((res)=>{
          this.processProposalResult(res);
        })
    }

    // Updated upstream
    getOrderedKeys(obj) {
        return _.sortBy(_.keys(obj), (k) => this.classList.indexOf(k));
    }

    getDonutData(dataType) {
        const asset_groups = angular.copy(this.data.report.analysis[dataType]);
        delete asset_groups.total;
        return _(this.getOrderedKeys(asset_groups))
            .map((k) => ({
                code: k.toUpperCase(),
                percentage: asset_groups[k][1] * 100,
                amount: asset_groups[k][0],
                percentageNotApplicable:
                    this.isAssetNotApplicable(k.toUpperCase(), dataType, DISPLAY_MODE.PERCENTAGE),
                amountNotApplicable:
                    this.isAssetNotApplicable(k.toUpperCase(), dataType, DISPLAY_MODE.MONEY),

            }))
            //.filter((item) => item.percentage)
            .value();
    }

    isAssetNotApplicable(assetName, portfolioStatus, displayMode) {
         const education4TargetPortfolio = (assetName == 'EDUCATION_PROPERTY' &&
                       portfolioStatus == PORTFOLIO_STATUS.TARGET);
         const education4CurrentPortfolioInPercentageMode = (assetName == 'EDUCATION_PROPERTY' &&
                        portfolioStatus == PORTFOLIO_STATUS.CURRENT &&
                        displayMode == DISPLAY_MODE.PERCENTAGE);
        return education4TargetPortfolio || education4CurrentPortfolioInPercentageMode;
    }

    changeInvestment(isIncrease) {
        const increase = isIncrease ? 100 : -100;
        const value = +this.data.planning_invest + increase;
        if (value >= 300) this.data.planning_invest = value;
        else if (!isIncrease && this.data.planning_invest >= 300) this.data.planning_invest = 300;
        this.changeInputValue();
    }

    changeInputValue(){
        clearTimeout(this.delayTime);
        this.deepTime();
    }

    deepTime() {
        const _this = this;
        const planInvest=this.data.planning_invest
        this.delayTime=setTimeout(function() {
            if (planInvest > 99999) {
                _this.LoadingService.showFailedLoading("超过上限99999万，请您重新输入");
                _this.data.planning_invest = 99999;
            }
            else if (planInvest >= 300) {
                _this.current_tab = TABS.TWO;
                _this.product_cur_tab = PTABS.ONE;
                _this.postAsset() 
                _this.planInvestState = 1;
            } else {
                _this.LoadingService.showFailedLoading("推荐300万起投，请您重新输入")
                _this.data.planning_invest = 300;
            }
        }, 2000);
    }

    changeOptionState(value) {
        this.option_state = this.option_state == value ? null : value
    }

    resetAssessment(){
        window.location.href = this.riskLevelRedirectWithNextUrl;
    }

    selectPeriod(item) {
        this.period_current = item;
        this.option_state = null
    }

    changeTab(v) {
        this.current_tab = v;
        if(v == 1){
            this.allocation = this.getDonutData('current_status')
        }else{
            //推荐配置
            this.allocation = this.getDonutData('target_status')

            //产品推荐
            if (this.groupsList == null) this.fetchProposal();
        }
    }

    productChangeTab(v) {
        this.product_cur_tab = v;
        //加载密度图 
        if(v == 2){
            this.LoadingService.requestingShowText('加载数据中...');
            this.UserModel.fetchPortfolioMain().then((res) => {
                const profitMap =  res.data.stats.profit_map;
                //PRC or Restful
                if(typeof profitMap[0][0][0] == 'string'){
                    this.changeObject(profitMap)
                }else{
                    this.profit_map = profitMap;
                }
                this.LoadingService.clean();
            });            
        }
    }

    viewPortfolioDetail() {
      this.StateService.forward('portfolio-detail', {});
    }

    viewKYC() {
      this.StateService.forward('kyc', {});
    }

    generatePortfolioBook(){
      if (!this.isPortfolioProposalValid) {
        this.$ionicPopup.confirm({
          template: '您修改的产品推荐金额不合法,点击确定放弃修改生成报告',
          okText: '确定',
          cancelText: '取消'
        }).then((confirm) => {
          if (confirm) {
            this.doGeneratePortfolioBook();
          }
        });
      }
      else {
        let productMap = {};
        let orignalAssetGroups = JSON.parse(this.originalAssetGroupStr);
        for(let groupKey of Object.keys(orignalAssetGroups)) {
          let group = orignalAssetGroups[groupKey];
          for(let product of group.products) {
            productMap[product.product_id] = product.amount;
          }
        }

        let isEqualToOrigin = true;
        if (this.portfolioProposalNewData) {
          for (let item of this.portfolioProposalNewData.item_list) {
            if (!(productMap[item.product] != null && productMap[item.product] == item.amount)) {
              isEqualToOrigin = false;
              break;
            }
          }
        }

        if (isEqualToOrigin) {
          this.doGeneratePortfolioBook();
        }
        else {
          this.LoadingService.requestingShowText('资产配置中...');
          this.UserModel.postProposal(this.portfolioProposalNewData).then((res) => {
            this.LoadingService.clean();
            this.doGeneratePortfolioBook();
          }, () => {
            this.LoadingService.clean();
          });
        }
      }
    }

    doGeneratePortfolioBook() {
      this.LoadingService.requestingShowText('报告生成中...');
      this.UserModel.postBook().then((res) => {
          let bookId = null;
          if(res.data != undefined || res.data != null) {
              const { id } = res.data;
              bookId =  id;
          } else {
              this.LoadingService.showFailedLoading("加载失败，请稍等再试");
          }
          this.LoadingService.clean();
          return bookId;
      }).then((bookId) => {
          bookId && this.saveToBookList(bookId);
      });
    }

    saveToBookList(bookId) {
      this.UserModel.generatePdf(bookId).then((res)=>{
        this.StateService.forward('bookList', { 'form':'1'});
        this.LoadingService.clean();
      });
    }

    viewbookList(){
        this.StateService.forward('bookList', { 'form':'0'});
    }

    goToApp(){
        window.ifaBridge.callHandler('close', null, null);
    }
}

const options = {
    controller: HomeCtrl,
    templateUrl: 'pages/crm/home.html',
};

export default options;
