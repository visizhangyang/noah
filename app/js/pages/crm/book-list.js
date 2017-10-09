import moment from 'moment';

class BookListCtrl {
  static get $inject() {
    return [
      '$log', '$http', 'SettingsService', '$stateParams', '$scope', '$filter',
      '$window', '$ionicViewSwitcher', 'ProgressService',
      'RefresherFactory', 'StateService',
      'UserModel', 'WechatService', '$ionicPopup','ShareDataService'
    ];
  }

  constructor(
    $log, $http, SettingsService, $stateParams, $scope,$filter,
    $window, $ionicViewSwitcher, ProgressService,
    RefresherFactory, StateService,
    UserModel, WechatService, $ionicPopup, ShareDataService
  ) {
    this.isCordova = $window.ionic.Platform.isWebView();

    this.$log = $log;
    this.$http = $http;
    this.SettingsService = SettingsService;
    this.$scope = $scope;
    this.$filter = $filter;
    this.$window = $window;
    this.StateService = StateService;
    this.ShareDataService = ShareDataService;
    this.$ionicViewSwitcher = $ionicViewSwitcher;
    this.UserModel = UserModel;
    this.clientId = $stateParams.clientId;
    this.WechatService = WechatService;
    this.$ionicPopup = $ionicPopup;
    this.needRefresh = false;
    this.otherInfo = this.ShareDataService.getOtherInfo();
    this.progressService = ProgressService;
    this.bookList = [];
    this.dataLoaded = false;

    this.refresher = new RefresherFactory(
      this.refreshFn.bind(this),
      $scope
    );

    this.setWatcher();
    this.$scope.$on('$ionicView.beforeLeave', () => {
      if (this.progressInterval) {
        this.progressService.$interval.cancel(this.progressInterval);
      }
      if(this.timer_id) {
        this.progressService.$interval.cancel(this.timer_id);
      }
    });
  }

  refreshTick(){
    if(this.needRefresh){
      this.fetchBookList();
    }
  }

  fetchBookList(){
    return this.UserModel.fetchBookList()
      .then((resp) => {
        this.bookList = resp.data.results;
        for (var i = 0; i < this.bookList.length; i++) {
          if (this.bookList[i].pdf_adopted_status == "0") {
            this.bookList[i].pdf_adopted_status = false;
          } else if (this.bookList[i].pdf_adopted_status == "1") {
            this.bookList[i].pdf_adopted_status = true;
          }
        }
        //this.bookList = [];
        this.needRefresh = this.bookList.find(p=>p.status == "PROCESSING") != null;
      });
  }

  refreshPdfProgress() {
    const progressInterval = this.progressService.$interval(() => {
      for (var i = 0; i < this.bookList.length; i++) {
        const book = this.bookList[i];
        if (book.status == 'SUCCESS') {
          const showCompleteMsg = this.userBaseInfo && parseInt(this.userBaseInfo.faId);
          this.progressService.complete(book.id, showCompleteMsg);
        } else {
          this.progressService.moveProgress(book.id);
        }
        book.progress = this.progressService.getProgress(book.id);
        if (book.progress == 98) {
          this.fetchBookList();
        }
      }
    }, 1000);
    return progressInterval;
  }

  refreshFn() {
    this.fetchBookList().then(() => {
      this.dataLoaded = true;
    })
    // return this.ClientModel.get(this.clientId)
    //   .then((resp) => {
    //     this.client = resp.data;
    //   });
  }

  setWatcher() {
    this.$scope.$on('$ionicView.beforeEnter', () => {
      this.refresher.call();
      this.progressInterval = this.refreshPdfProgress();
      this.timer_id = this.progressService.$interval(() => {
        this.refreshTick();
      }, 1000 * 20);
      this.userBaseInfo = this.ShareDataService.getUserBaseInfo();
      // 1为来自点击保存报告按钮-弹出预约理财师功能
      if(parseInt(this.StateService.state.params.form) == 1){
        this.financialPlanner(this.userBaseInfo.faId, this.userBaseInfo.applyFa);
      }
    });
  }

  financialPlanner(faId, applyFa) {
    if(this.userHasNoFP(faId, applyFa)) {
      this.updateUserInfo().then((baseInfo) => {
        if (this.userHasNoFP(baseInfo.faId, baseInfo.applyFa)) this.showPopup4FP();
      });
     }
  }

  userHasNoFP(faId, applyFa) {
    return parseInt(faId) == 0 && parseInt(applyFa) == 0;
  }

  updateUserInfo() {
    return this.UserModel.getBaseInfo().then((res) => {
      const baseInfo = res.result;
      this.userBaseInfo = baseInfo;
      this.ShareDataService.setUserBaseInfo(baseInfo);
      return baseInfo;
    });
  }


  showPopup4FP() {
    const confirmPopup = this.$ionicPopup.confirm({
      template: '是否需要配置理财师?',
      buttons: [{
        text: '取消',
        type: '',
        scope: null,
        onTap: function(e) {
          return;
        }
      }, {
        text: '预约理财师',
        type: '',
        onTap: function(e) {
          //加载APP预约理财师功能
          window.location.href="noahstd://applyfa?sourceCode=2";
        }
      }]
    });
    return confirmPopup;
  }

  preview(book) {
    if (this.SettingsService.isNativeApp) {
      const reportName = '资产配置报告书';
      window.location.href = `noahstd://pdf?title=${reportName}&url=${book.pdf}`;
    } else {
      this.$window.open(book.pdf, '_system');
    }
  }

  accept(book) {
    this.UserModel.acceptBook(book.id, !book.pdf_adopted_status).then((res) => {
      book.pdf_adopted_status = !book.pdf_adopted_status;
    }, err => {
      // Need to implement;
    });
  }

  // TODO: verify that this is is working for
  //       2. cordova real device with wechat installed
  shareWechat(book) {
    var params = {
      message: {
        title: "投资组合报告书.pdf",
        description: `${this.client.name} 的投资组合报告书`,
        media: {
          type: this.WechatService.plugin.Type.FILE,
          file: book.pdf,
          fileExtension: 'pdf'
        }
      }
    };


    this.WechatService.shareToSession(
      params
    ).then(
      () => {
        this.$ionicPopup.alert({
          title: '分享成功',
          template: '文件已经分享给好友',
        });
      },
      (error) => {
        this.$ionicPopup.alert({
          title: '分享失败',
          template: error,
        });
      }
    );
  }

  backList() {
    this.StateService.doneTo('home');
  }

  viewKYC() {
    this.StateService.forward('kyc', {});
  }
}

const options = {
  controller: BookListCtrl,
  templateUrl: 'pages/crm/book-list.html',
};

export default options;
