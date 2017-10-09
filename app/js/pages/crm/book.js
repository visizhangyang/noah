import Clipboard from 'clipboard'

var clipboard = null;

class BookCtrl {
  static get $inject() {
    return [
      '$log', '$http', 'SettingsService', '$stateParams', '$scope',
      '$window', '$ionicViewSwitcher',
      'StateService', 'UserModel',
      'ClientModel', 'WechatService', '$ionicPopup', 'LoadingService'
    ];
  }

  constructor(
    $log, $http, SettingsService, $stateParams, $scope,
    $window, $ionicViewSwitcher,
    StateService,
    UserModel, ClientModel, WechatService, $ionicPopup, LoadingService
  ) {
    this.$log = $log;
    this.$http = $http;
    this.SettingsService = SettingsService;
    this.$scope = $scope;
    this.$window = $window;
    this.StateService = StateService;
    this.$ionicViewSwitcher = $ionicViewSwitcher;
    this.UserModel = UserModel;
    this.ClientModel = ClientModel;
    this.clientId = $stateParams.clientId;
    this.bookId = $stateParams.bookId;
    this.isPdfGenerated = $stateParams.isPdfGenerated === 'true';
    this.fromPage = $stateParams.fromPage;
    this.hideLink = this.fromPage == 'book-list';
    this.WechatService = WechatService;
    this.$ionicPopup = $ionicPopup;
    this.LoadingService = LoadingService;
    this.reportStandardLink = `/proposal_book/${this.bookId}`;
    //this.reportStandardLink = 'http://localhost8000/api/users/proposal_book/' + this.bookId;
    //console.log(this.reportStandardLink)
  }

  share() {
    return this.ClientModel.getReportShareLink(this.bookId)
      .then((resp) => resp.data.share_link).then(this.showShareLink.bind(this));
  }

  showShareLink(link) {
    link = this.SettingsService.baseURL + link.trimLeft('/');

    var myPopup = this.$ionicPopup.show({
      title: '分享报告书',
      template: `<div><a target="_blank" href="${link}">${link}</a></div>`,
      cssClass: 'pdf-share-popup-container',
      scope: this.$scope,
      buttons: [
        {
          text: '取消',
        },
        {
          text: '复制链接',
          type: 'clipboard-pdf-link',
        }
      ]
    })

    if (clipboard) {
      clipboard.destroy();
      clipboard = null;
    }

    clipboard = new Clipboard('.clipboard-pdf-link', {
      text: function (trigger) {
        return '投资组合报告书：' + link;
      }
    });
    var LoadingService = this.LoadingService;
    clipboard.on('success', function (e) {
      LoadingService.showToast('报告书链接已复制至剪贴板<br/>您可以通过微信等方式发送');
    });
    clipboard.on('error', function (e) {
      console.error('Action:', e.action);
      console.error('Trigger:', e.trigger);
    });
  }

  saveToBookList() {
    this.LoadingService.requestingShowText('报告生成中...');
    this.UserModel.generatePdf(this.bookId).then((res)=>{
      this.StateService.forward('bookList', { 'form':'1'});
      this.LoadingService.clean();
    });
  }

  goToBookList() {
    this.StateService.forward('bookList', {});
  }

  viewHome() {
    this.StateService.doneTo('home',{})
  }

  viewKYC() {
    this.StateService.forward('kyc', {});
  }
}

const options = {
  controller: BookCtrl,
  templateUrl: 'pages/crm/book.html',
  params: {
    fromPage: null,
  }
};

export default options;
