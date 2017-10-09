export default class UserModel {
  static get $inject() {
    return [
      '$q', '$log', '$http', '$rootScope', '$ionicHistory',
      'StateService', 'ApiService', 'DeviceService',
    ];
  }

  constructor(
    $q, $log, $http, $rootScope, $ionicHistory,
    StateService, ApiService, DeviceService
  ) {
    this.$log = $log;
    this.$http = $http;
    this.$rootScope = $rootScope;
    this.$ionicHistory = $ionicHistory;
    this.StateService = StateService;
    this.ApiService = ApiService;
    this.bareUserApi = ApiService.baseApi.all('users');
    this.authUserApi = ApiService.authApi.all('users');
    this.noahUserApi = ApiService.baseApi.all('noah');
    this.DeviceService = DeviceService;
    this.features = {};

    this.errorCodeDict = {
      phone_unregistered: '手机号没有注册',
      login_failed_error: '手机,验证码有误,请重试',
      serializer_validation_error: '提交的数据有误',
      phone_registered: '该手机号已被注册过了',
      user_has_active_phone: '您已经用这个手机号注册过了一次',
      phone_verification_error: '验证码不正确或已经过期，请尝试重新发送验证码',
      phone_not_found: '请先发送验证码到这个手机号',
      phone_verification_send_failed: '无法发送短信，请联系弥财支持团队',
      incorrect_password: '密码不正确',
      invalid_invite_code: '输入的邀请码不存在',
      account_inactive: '您的试用账户已过期，如果需要重新获得授权登录，请与弥财公司联系(support@micaiapp.com)',
    };

    this.errorCb = this.ApiService.errorMsgInterceptor(this.errorCodeDict);

    this.setup = $q.defer();
  }

  isLogged() {
    return !!this.$http.defaults.headers.common.Authorization;
  }

  onSetupReady() {
    return this.setup.promise;
  }

  ready(fn) {
    return this.onSetupReady().then(() => fn(this.authUserApi));
  }

  setLogged(token, saveStorage = true) {
    this.setup.resolve();
    // if (token != null && token.length > 0) {
    //   this.$http.defaults.headers.common.Authorization = `Token ${token}`;
    // } else {
    //   delete this.$http.defaults.headers.common.Authorization;
    // }
    //
    // if (saveStorage) {
    //   this.DeviceService.setToken(token)
    //     .catch((err) => {
    //       this.$log.error('Save device token failed', err);
    //     });
    // }
  }

  /**
   * Init $http token: read from localStorage & save it to $http
   * - call it initial bootstrapping app
   *
   * @returns {*|r.promise|promise}
   */
  checkLogged() {
    this.DeviceService.getToken()
      .then((token) => {
        this.setLogged(token, false);
        // this.initFeatures();
      }, (err) => {
        this.$log.error('Get device token failed', err);
        this.setLogged(null, false);
      });
  }

  listenLogout() {
    this.$rootScope.$on('unusable.unauth', () => {
      this.logout(false);
    });
  }

  logout(syncBackend) {
    if (syncBackend) {
      this.authUserApi.customPOST({}, 'logout');
    }
    this.setLogged(null);
    this.clearFeatures();

    this.$ionicHistory.clearHistory();
    return this.$ionicHistory.clearCache()
      .then(() => {
        this.StateService.forwardToRoot('landing');
      });
  }

  login(user) {
    return this.bareUserApi.customPOST(user, 'password_login')
      .then((resp) => {
        const token = resp.data.token;
        this.setLogged(token);
        this.initFeatures();
        return resp;
      },
        this.errorCb
      );
  }

  smsLogin(phone, code) {
    const isSecondStep = !!code;

    return this.bareUserApi.customPOST({ phone, code }, 'login')
      .then((resp) => {
        if (isSecondStep) {
          const token = resp.data.token;
          this.setLogged(token);
          this.initFeatures();
        }
        return resp;
      },
        this.errorCb
      );
  }

  signup(phone, code, password, inviteCode) {
    const isSecondStep = !!code;

    return this.bareUserApi.customPOST({
      phone,
      code,
      password,
      invite_code: inviteCode,
    }, 'register')
      .then((resp) => {
        if (isSecondStep) {
          const token = resp.data.token;
          this.setLogged(token);
          // this.initFeatures();
        }
        return resp;
      },
        this.errorCb
      );
  }

  resetPassword(code, password) {
    const fn = (api) => api.customPOST({ code, password }, 'set_password').catch(this.errorCb);
    return this.ready(fn);
  }

  fetchDetail() {
    const fn = (api) => api.customGET('user_details');
    return this.ready(fn);
  }

  postDetail(params) {
    const fn = (api) => api.customPOST(params, 'user_details')
      .catch(this.errorCb);

    return this.ready(fn);
  }

  postFeedback(userFeedback) {
    const formData = new FormData();
    Object.keys(userFeedback).forEach((key) => {
      if (key === 'images') {
        userFeedback[key].forEach((item) => {
          formData.append(`${key}`, item);
        });
      } else {
        formData.append(key, userFeedback[key]);
      }
    });

    const fn = (api) => api.customPOST(formData, 'feedback', undefined,
        { 'Content-Type': undefined }
      ).catch(this.errorCb);
    return this.ready(fn);
  }

  fetchNameCard() {
    const fn = (api) => api.customGET('name_card');
    return this.ready(fn);
  }

  postNameCard(params) {
    const fn = (api) => api.customPOST(params, 'name_card', undefined, {
      'Content-Type': undefined,
    });
    const promise = this.ready(fn);
    return promise.catch(this.errorCb);
  }

  fetchProducts(payload) {
    const fn = (api) => api.all('products').getList(payload);
    return this.ready(fn);
  }

  fetchCollection(payload) {
    const fn = (api) => api.all('collections').getList(payload);
    return this.ready(fn);
  }

  postCollect(payload) {
    const fn = (api) => api.customPOST(payload, 'collections');
    return this.ready(fn);
  }

  deleteCollect(collectionId) {
    const fn = (api) => api.all('collections').one(`${collectionId}`).remove();
    return this.ready(fn);
  }

  fetchMessages() {
    /* deprecated
    const fn = (api) => api.all('messages').getList();
    return this.ready(fn);
    */
  }

  fetchQuestionnaire() {
    /* deprecated
    return this.bareUserApi.all('questionnaire_schema').customGET();
    */
  }

  postQuestionnaire(data) {
    /* deprecated
    const fn = (api) => api.all('clients').customPOST(data, 'questionnaire');
    return this.ready(fn);
    */
  }

  fetchTargets() {
    return this.bareUserApi.all('asset_target').customGET();
  }

  fetchRiskalyzeSchema() {
    return this.bareUserApi.all('riskalyze_schema').customGET();
  }

  fetchFeatures() {
    return this.authUserApi.all('features').customGET();
  }

  initFeatures() {
    // this.clearFeatures();
    // if (this.isLogged()) {
    //   this.fetchFeatures().then((result) => {
    //     result.data.features.forEach((feature) => {
    //       this.features[feature] = true;
    //     });
    //   });
    // };
  }

  clearFeatures() {
    this.features = {};
  }

  fetchAsset() {
    return this.authUserApi.all('asset_allocation').customGET();
  }

  postAsset(params) {
    const fn = (api) => api.all('asset_allocation').customPOST(params);
    return this.ready(fn);
  }

  fetchProposal() {
    const fn = (api) => api.all('portfolio_proposal').customGET();
    return this.ready(fn);
  }

  postProposal(params) {
    const fn = (api) => api.all('portfolio_proposal').customPOST(params);
    return this.ready(fn);
  }

  fetchBookList() {
    const fn = (api) => api.all('all_proposal_books').customGET();
    return this.ready(fn);
  }

  postBook() {
    const fn = (api) => api.all('all_proposal_books').customPOST({});
    return this.ready(fn);
  }

  acceptBook(id, status) {
    const fn = (api) => api.all('proposal_book').one(id + '').all('adopt_pdf').one(status).customPOST({});
    return this.ready(fn);
  }

  generatePdf(bookId) {
    let bookIdStr = new String(bookId);
    const fn = (api) => api.all('all_proposal_books').all('async_generate_pdf').one(bookIdStr).customPOST({});
    return this.ready(fn);
  }

  getBaseInfo() {
    return new Promise((resolve, reject) => {
      resolve({
        result: {
          realName:"测试联调四",
          sex:"1",
          age:"32",
          isTestRisk:"1",
          riskLevel:"5",
          riskText:"激进型",
          riskExpire:"2017-12-19",
          accountType:"0",
          faId:"5015",
          faName:"潘颖",
          applyFa:"0",
          investStatus: "2",
          accreditedInvestorStatus:"0",
          professionalInvestorInfo:{
              "investYears":"0",
              "userProfessionalQuestionStatus":"0",
              "professionalInvestorSelfStatus":"2",
              "professionalInvestorStatus":"0",
              "professionalInvestorApplyStatus":"13",
              "professionalInvestorExpireStartTime":"0",
              "professionalInvestorExpireEndTime":"0"
          }
        }
      });
    });
  }

  post(params) {
    const fn = (api) => api.customPOST(params);
    return this.ready(fn);
  }


  fetchYinoTag() {
    const fn = () => this.noahUserApi.customGET('YINO_tag_schema');
     return this.ready(fn);
  }

  fetchPortfolioMain() {
    const fn = (api) => api.all('portfolio_proposal/stats/').customGET();
    return this.ready(fn);
  }

}
