export default class ShareDataService {

  constructor() {
    this.userBaseInfo = {};
    this.assetAllocation = {};
    this.clientInfo = {};
    // kycStatus: 0: don't do, 1: doing, 2: done
    this.otherInfo = { currentKycStep: 1, kycStatus: 0, backHome: 0 };
  }

  getUserBaseInfo() {
    return this.userBaseInfo;
  }

  setUserBaseInfo(userBaseInfo) {
    this.userBaseInfo = userBaseInfo;
  }

  getAssetAllocation() {
    return this.assetAllocation;
  }

  setAssetAllocation(assetAllocation) {
    this.assetAllocation = assetAllocation;
  }

  getProcessProposal() {
    return this.processProposal;
  }

  setProcessProposal(processProposal) {
    this.processProposal = processProposal;
  }

  getClientInfo() {
    return this.clientInfo;
  }

  setClientInfo(clientInfo) {
    this.clientInfo = clientInfo;
  }

  getOtherInfo() {
    return this.otherInfo;
  }

  setOtherInfo(otherInfo) {
    this.otherInfo = otherInfo;
  }

}

ShareDataService.$inject = [];
