export default class ProgressService {
  constructor($interval, LoadingService) {
    this.$interval = $interval;
    this.loadingService = LoadingService;
    this._progressDic = {};
  }

  moveProgress(bookId) {
    const currentProgress = this.getProgress(bookId);
    const step = currentProgress < 50 ? 4 : 2;
    if (currentProgress != null) {
      this._setProgress(bookId, currentProgress + step);
    } else {
      this._setProgress(bookId, 0);
    }
  }

  getProgress(bookId) {
    return this._progressDic[bookId];
  }

  complete(bookId, showCompleteMsg) {
    if (this._progressDic[bookId] && this._progressDic[bookId] < 99) {
      this._progressDic[bookId] = 99;
      showCompleteMsg && this.loadingService.completeToast('您的报告已生成，理财师将在3个工作日内为您详细解答报告内容', 5000);
    } else {
    this._progressDic[bookId] = 100;
    }
  }

  _setProgress(bookId, progress) {
    this._progressDic[bookId] = progress > 99 ? 99 : progress;
  }
}

ProgressService.$inject = ['$interval', 'LoadingService'];
