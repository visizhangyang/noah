class KycCtrl {
  static get $inject() {
    return [
      '$scope', '$ionicActionSheet' ,'$ionicScrollDelegate','UserModel',
      'FinanceModel','StateService', 'ShareDataService', 'LoadingService',
      'PopupService'
    ];
  }

  constructor(
    $scope, $ionicActionSheet, $ionicScrollDelegate , UserModel, FinanceModel,
    StateService, ShareDataService, LoadingService , PopupService,
  ) {
    this.$scope = $scope;
    this.StateService = StateService;
    this.LoadingService = LoadingService;
    this.ShareDataService = ShareDataService;
    this.$ionicActionSheet = $ionicActionSheet;
    this.ionicScrollDelegate = $ionicScrollDelegate;
    this.popupService = PopupService;

    this.returnData = {};
    this.UserModel = UserModel;
    this.FinanceModel = FinanceModel;

    this.otherInfo = this.ShareDataService.getOtherInfo();
    this.otherInfo.kycStatus = 1;
    this.otherInfo.backHome = 1;
    this.step = this.otherInfo.currentKycStep || 1;
    this.title = this.getTitle();

    this.selectList = [];
    this.selectListlength = null;

    this.setupHooks();

    // 财务状况
    //this.financeData = {annual_income:0,annual_expenditure:0,liability:0,yearly_repayment:0};
    this.onChangeIncome = this.onChangeAssetAllocation('annual_income');
    this.onChangeExpenditure = this.onChangeAssetAllocation('annual_expenditure');
    this.onChangeLiability = this.onChangeAssetAllocation('liability');
    this.onChangeRepayment = this.onChangeAssetAllocation('yearly_repayment');

    // 保障需求
    this.onChangeRetirementAge = this.onChangeAssetAllocation('retirement_age');
    this.onChangeAnnualExpenditure = this.onChangeAssetAllocation('annual_expenditure');
    this.onChangeIncomeRatio = this.onChangeAssetAllocation('personal_income_family_income_share');
    this.onChangeChildrenEducationBudget = this.onChangeAssetAllocation('children_education_budget');
    this.onChangeInheritanceAmount = this.onChangeAssetAllocation('inheritance_amount');

    this.clientGenderOptions = [
      { name: '男', value: 1 },
      { name: '女', value: 2 }
    ];

    this.clientAgeOptions = [];
    for(let i = 18; i <= 100; i++) {
      this.clientAgeOptions.push(i);
    }
  }

  setupHooks() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.fetchYinoTag() //加载课程

      this.userBaseInfo = this.ShareDataService.getUserBaseInfo();
      this.extRiskLevel = parseInt(this.userBaseInfo.riskLevel) || 3;
      this.assetAllocation = this.ShareDataService.getAssetAllocation();
      this.riskLevel = (this.assetAllocation.risk_level - 1) % 10 + 1;
      if (!this.assetAllocation.expect_medical_standards) {
        this.assetAllocation.expect_medical_standards = 1;
      }

      this.clientInfo = this.ShareDataService.getClientInfo();
      this.clientInfo.gender = parseInt(this.userBaseInfo.sex) || null;
      this.clientInfo.age = parseInt(this.userBaseInfo.age) || null;

      this.FinanceModel.fetchRiskalyzeSchema(this.extRiskLevel * 10).then((res) => {
        this.returnData = res.data.data;
      });

      // 投资全貎
      this.assetData = {
        public_funds: this.assetAllocation.public_funds + this.assetAllocation.extra_public_funds,
        fixed_income: this.assetAllocation.fixed_income + this.assetAllocation.extra_fixed_income,
        private_equity: this.assetAllocation.private_equity + this.assetAllocation.extra_private_equity,
        private_property: this.assetAllocation.private_property + this.assetAllocation.extra_private_property,
        private_equity_securities: this.assetAllocation.private_equity_securities + this.assetAllocation.extra_private_equity_securities,
        financial_management: this.assetAllocation.financial_management + this.assetAllocation.extra_financial_management
      };
      this.onChangePublicFunds = this.onChangeAssetData('public_funds');
      this.onChangeFixedIncome = this.onChangeAssetData('fixed_income');
      this.onChangePrivateEquity = this.onChangeAssetData('private_equity');
      this.onChangePrivateProperty = this.onChangeAssetData('private_property');
      this.onChangePrivateEquitySecurities = this.onChangeAssetData('private_equity_securities');
      this.onChangeFinancialManagement = this.onChangeAssetData('financial_management');
    });
  }

  prev() {
    this.syncData();
    this.step--;
    this.title = this.getTitle();
    this.scrollTop();
    this.otherInfo.currentKycStep = this.step;
  }

  next() {
    this.syncData();
    this.step++;
    this.title = this.getTitle();
    this.scrollTop();
    this.otherInfo.currentKycStep = this.step;
  }

  syncData() {
    if (this.step == 1) {
      this.assetAllocation.risk_level = (this.extRiskLevel - 1) * 10 + parseInt(this.riskLevel);
    }
    else if(this.step == 4) {
      this.assetAllocation.qa_course_answer = this.course //财务状态
    }
    else if (this.step == 5) {
      this.assetAllocation.extra_public_funds = this.assetData.public_funds - this.assetAllocation.public_funds;
      this.assetAllocation.extra_fixed_income = this.assetData.fixed_income - this.assetAllocation.fixed_income;
      this.assetAllocation.extra_private_equity = this.assetData.private_equity - this.assetAllocation.private_equity;
      this.assetAllocation.extra_private_property = this.assetData.private_property - this.assetAllocation.private_property;
      this.assetAllocation.extra_private_equity_securities = this.assetData.private_equity_securities - this.assetAllocation.private_equity_securities;
      this.assetAllocation.extra_financial_management = this.assetData.financial_management - this.assetAllocation.financial_management;
    }
  }

  complete() {
    this.saveData(() => {
      this.otherInfo.currentKycStep = 1;
      this.otherInfo.kycStatus = 2;
      this.otherInfo.backHome = 1;
    })
  }

  saveData(moreAction) {
    this.syncData();
    let p1 = this.UserModel.post(this.clientInfo).then((res) => {
      this.ShareDataService.setClientInfo(res.data);
    });

    let p2 = this.UserModel.postAsset(this.assetAllocation).then((res) => {
      this.ShareDataService.setAssetAllocation(res.data);
    });

    Promise.all([p1, p2]).then(() => {
      moreAction();
      this.StateService.doneTo('home', {});
    });
  }

  getTitle() {
    switch(this.step) {
      case 1:
        return '风险承受度';
      case 2:
        return '财务状况';
      case 3:
        return '保障需求';
      case 4:
        return '教育规划';
      case 5:
        return '投资全貌';
      default:
        return '';
    }
  }

  onChangeSlide(prop) {
    return (value) => {
      if (this.financeData == null || this.financeData[prop] == value) return;
      this.financeData[prop] = value;
    };
  }

  fetchYinoTag(){
    this.UserModel.fetchYinoTag().then((res) => {
        const result = res.data;
        const bool=result[0].checked_flag;
        if(typeof bool == 'boolean' || typeof bool == 'number'){
          //数据过滤
          const resultMap=result.map((item) => {
              const result = _.clone(item);
              return result;
          })
          this.course = resultMap
        }else{
          this.formattedData(result);
        }
    })
  }

  formattedData(data){
    this.course = data
    this.course.forEach(function(d,i){
      if(d.display_form == 2){
        d.children.forEach(function(res,index){
          if(res.checked_flag == "1"){
            res.checked_flag = true;
          }else{
            res.checked_flag = false;
          }
        },this)
      }
    },this);
    //console.log(data)
  }

  radioChange(index,items){
    const childrens = items.children;
    childrens.forEach(function(d,i) {
        childrens[i].checked_flag = false;
    }, this);
    childrens[index].checked_flag = true;
  }

  ionicActionSheet(items,index,$event,tab){
    console.log(items.default_seleted_text)
    const _this=this;
    const itemsList = items;
    const childrens = items.children;
    const actionSheetList =[];
    this.ionicActionSheetHide = true;
    //TAB ONE
    if(tab == 1){
      this.tipsText='请选择最重要的课程 :'
      childrens.forEach(function(data,index) {
          actionSheetList.push({text:data.text,depth:data.depth})
      }, this);
      // Get Y
      this.setEventY($event.y)
    }else{
      this.tipsText='请选择次重要的课程 :'
      const selectListlength = _this.selectList[_this.selectList.length - 1];
      const selectedDepth=itemsList.default_seleted_text;
      if(itemsList.fristInputOrder != undefined
        || selectedDepth[0].depth != ''){
          childrens.forEach(function(data,index) {
            if(parseInt(selectedDepth[0].depth) != index && parseInt(selectedDepth[1].depth) != index){
              actionSheetList.push({text:data.text,depth:data.depth})
            }
          }, this);
          this.ionicActionSheetHide = true;
          // Get Y
          this.setEventY($event.y)
      }else{
          this.LoadingService.showToast('请先选择最重要的课程！');
          this.ionicActionSheetHide = false;
          $event.stopPropagation();
          return false;
      }
    }
    // 点击按钮触发，或一些其他的触发条件
    this.actionSheetShow = function() {
      // 显示操作表
      this.$ionicActionSheet.show({
        buttons: actionSheetList,
        titleText: this.tipsText,
        cancelText: '取消',
        cancel:function(){
          //scrollY
          _this.scrollY();
        },
        buttonClicked: function(indexs,res) {
          const depth=res.depth
          //action Sheet Selected
          _this.selectList.push(depth);
          //Tab 
          if(tab == 1){
            //Text
            itemsList.default_seleted_text[0].text = res.text;
            itemsList.default_seleted_text[0].depth = depth;
            itemsList.default_seleted_text[1].text = '';
            itemsList.default_seleted_text[1].depth = '';
            _this.processingData(childrens,itemsList,depth,res); 
            itemsList.fristInputOrder = depth;
            childrens[depth].user_selected_order = 1; //0：不选（默认）1：首选 2：次选
          }else{
            //Text
            itemsList.default_seleted_text[1].text = res.text;
            itemsList.default_seleted_text[1].depth = depth;   
            _this.processingData(childrens,itemsList,depth,res);          
            itemsList.lastInputOrder = depth;
            childrens[depth].user_selected_order = 2; //0：不选（默认）1：首选 2：次选
          }
          //checked
          childrens[depth].checked_flag = true;

          //scrollY
          _this.scrollY();

          return true;
        }
      });
    };
    if(this.ionicActionSheetHide){
      this.actionSheetShow();
    }
  }

  setEventY(y){
      if(y > 400){
        angular.element(document.querySelector(".scroll")).attr('class','scrollForEach');
        var scrollY = JSON.parse(y - 20);
        this.ionicScrollDelegate.scrollTo(0,scrollY);//修改滚动条位置
      }
  }

  scrollY(){
      this.ionicScrollDelegate.scrollTo(0,100);//修改滚动条位置
      angular.element(document.querySelector(".scrollForEach")).attr('class','scroll');
  }

  scrollTop(){
      this.ionicScrollDelegate.scrollTo(0,0);//滚动顶端

  }

  processingData(childrens,items,depth,res){
      childrens.forEach(function(d,i) {
        if(parseInt(items.default_seleted_text[0].depth) == i){
          childrens[i].user_selected_order = 1;
        }else{
          childrens[i].checked_flag = false;
          childrens[i].user_selected_order = 0;          
        }
      }, this);
  }


  viewHomePage() {
    this.saveData(() => {
      this.otherInfo.currentKycStep = this.step;
      this.otherInfo.backHome = 1;
    });
  }

  onChangeAssetAllocation(prop) {
    return (value) => {
      this.assetAllocation[prop] = value;
    };
  }

  onChangeAssetData(prop) {
    return (value) => {
      this.assetData[prop] = value;
    };
  }

  showPropertyDesc() {
    this.popupService.showPropertyDescription();
  }
}

const options = {
  controller: KycCtrl,
  templateUrl: 'pages/crm/kyc.html',
};

export default options;
