
const moduleName = 'unicorn.filter.product';
export default moduleName;

function transStatus() {
  const transStatusMap = {
    APPROVED: '审核通过',
    AUDITING: '审核中',
    REJECTED: '审核未通过',
  };

  return (status) => transStatusMap[status] || status;
}

function benchmarkInvest() {
  return (benchmark) => {
    if (benchmark.investment_amount_max) {
      return `${benchmark.investment_amount}≤x≤${benchmark.investment_amount_max}`;
    }
    return `${benchmark.investment_amount}≤x`;
  };
}
function benchmarkReturn() {
  return (benchmark) => {
    if (benchmark.expected_annual_return) {
      return `${benchmark.expected_annual_return}%`;
    }
    return '浮动';
  };
}

function checkboxStatus() {
  const translation = {
    ture: '1',
    false: '0',
  };
  return (pay) => translation[pay] || pay;
}

function productStatus() {
  const productTransStatus = {
    PREPARATION: '预热',
    SELLING: '销售中',
    SOLD_OUT: '售罄',
    SUSPEND: '暂停',
  };
  return (status) => productTransStatus[status] || status;
}

function transPayDate() {
  const translation = {
    ESTABLISHMENT: '成立现结',
    DEPOSIT: '打款现结',
  };
  return (pay) => translation[pay] || pay;
}

function trans() {
  const translation = {
    COMMERCIALS: '工商企业',
    FINANCIALS: '金融市场',
    INFRASTRUCTURE: '基础设施',
    REAL_ESTATE: '房地产',
    MINERS: '工矿企业',
    FUNDING_POOL: '资金池',
    OTHER: '其他',
    MONTHLY: '按月付息',
    QUARTERLY: '按季付息',
    'SEMI-ANNUALLY': '半年付息',
    YEARLY: '按年付息',
    MATURITY: '到期付息',
    FIXED: '固定付息',
    SMALL_SMOOTH_PAY: '小额畅打',
    ALL_LARGE: '全大额',
    STRICT_PROPORTION: '严格配比',
    B1_S1: '严格配比 一大一小',
    B2_S1: '严格配比 两大一小',
    B3_S1: '严格配比 三大一小',
    B4_S1: '严格配比 四大一小',
    LOAD: '贷款类',
    STOCK: '股票类',
    BOND: '债权类',
    QUANTITATIVE_HEDGING: '量化对冲',
    ADDITIONAL_STOCK_ISSUE_TAILED: '定向增发',
    NEW_OTC_MARKET: '新三板',
    MIXED_TYPE: '混合型',
    STRUCTURED: '结构化',
    PURCHASE_OF_NEW_SHARES: '打新股',
  };
  return (text) => translation[text] || text;
}

function transAsset() {
  const translation = {
    PUBLIC_FUNDS: '公募基金',
    FIXED_INCOME: '类固收',
    PRIVATE_EQUITY: '私募股权',
    PRIVATE_PROPERTY: '房地产基金',
    PRIVATE_EQUITY_SECURITIES: '二级市场',
    FINANCIAL_MANAGEMENT: '理财',
    EDUCATION_PROPERTY: '教育',
    GLOBAL_STOCK: '欧美全球股票',
    EMERGING_MARKET_EQUITY: '亚洲新兴市场股票',
    CHINA_STOCK: '中国股票',
    GLOBAL_BOND: '全球债券',
    EMERGING_MARKET_BOND: '新兴市场债券',
    P2P: '个人债',
    PERSONAL_RE: '自住性房产',
    PLANNING_INVEST: '计划投资金额',
  };
  return (text) => translation[text] || text;
}

function transRiskLabel() {
  return (level) => {
    if (_.isNil(level)) {
      return '';
    } else if (level <= 4) {
      return '(稳健型)';
    } else if (level > 4 && level <= 7) {
      return '(平衡型)';
    }
    return '(激进型)';
  };
}

function transRiskLevel() {
  return (level) => {
    if (level === 'HIGH') {
      return '高';
    } else if (level === 'MIDDLE') {
      return '中';
    } else if (level === 'LOW') {
      return '低';
    }
    return '-';
  };
}

function investorStatus() {
  return (level) => {
    if(level != null){
      //0未认定 1已认定 2已过期
      if (level.professionalInvestorInfo.professionalInvestorStatus === "1") {
        return '专业投资者';
      }else if(level.accreditedInvestorStatus === "1"){
        return '合格投资者';
      }else{
        return '普通投资者';
      }
    }else{
      return '普通投资者';
    }
  };
}

function formatNum($filter) {
  const number = $filter('number');
  return (num, signed, fractionSize = 2) => {
    if (!num || isNaN(num)) {
      return num;
    }
    let result = number(num, fractionSize);
    result = result.replace(/\.00$/, '');
    result = result.replace(/(\.\d)0$/, '$1');
    if (signed && num > 0) {
      result = `+${result}`;
    }
    return result;
  };
}
formatNum.$inject = ['$filter'];

function formatMoney($filter) {
  const formatNumber = $filter('formatNum');
  return (num, signed) => formatNumber(num, signed, 0);
}
formatMoney.$inject = ['$filter'];

function formatPercent($filter) {
  const formatNumber = $filter('formatNum');
  return (num, signed, fractionSize = 1) => formatNumber(num, signed, fractionSize);
}
formatPercent.$inject = ['$filter'];

function formatPercentWithSign($filter) {
  const formatPercentFilter = $filter('formatPercent');
  return (num, signed, fractionSize = 1) => formatPercentFilter(num, signed, fractionSize) + '%';
}

function riskLevelLabel() {
  return (risk_level) => {
    if (risk_level <= 20)
      return '保守型'
    if (risk_level <= 40)
      return '稳健型'
    if (risk_level <= 60)
      return '平衡型'
    if (risk_level <= 80)
      return '积极型'
    else
      return '激进型'
  }
}

formatPercentWithSign.$inject = ['$filter'];

function midlineIfZero() {
  return (num) => {
    if (num === 0 || num === '0%') {
      return '--';
    } else {
      return num;
    }
  }
}

angular.module(moduleName, [])
  .filter('trans', trans)
  .filter('transRiskLevel', transRiskLevel)
  .filter('transAsset', transAsset)
  .filter('transRiskLabel', transRiskLabel)
  .filter('formatNum', formatNum)
  .filter('formatMoney', formatMoney)
  .filter('formatPercent', formatPercent)
  .filter('formatPercentWithSign', formatPercentWithSign)
  .filter('transPayDate', transPayDate)
  .filter('productStatus', productStatus)
  .filter('benchmarkInvest', benchmarkInvest)
  .filter('benchmarkReturn', benchmarkReturn)
  .filter('transStatus', transStatus)
  .filter('midlineIfZero', midlineIfZero)
  .filter('riskLevelLabel', riskLevelLabel)
  .filter('investorStatus', investorStatus);
