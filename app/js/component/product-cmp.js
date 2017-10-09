/** copy from ./proposal-cmp */

const classList = [
        'PUBLIC_FUNDS', 'FIXED_INCOME', 'PRIVATE_EQUITY',
        'PRIVATE_PROPERTY', 'PRIVATE_EQUITY_SECURITIES', 'FINANCIAL_MANAGEMENT', 'EDUCATION_PROPERTY'
        ];

const MODE = {
    'money': 'money',
    'percentage': 'percentage',
}

class ProductCmpCtrl {
    static get $inject() {
        return ['$scope', '$timeout', '$ionicScrollDelegate', 'CommonService', 'LoadingService', 'PopupService'];
    }

    constructor($scope, $timeout, $ionicScrollDelegate, CommonService, LoadingService, PopupService) {
        let self = this;
        $scope.$watch(() => this.data, (newV) => {
          this.planningInvestment = newV.allocation_analysis.adjust.total;
          const groupsList = this.getDonutData(newV.asset_groups, this.planningInvestment);
          groupsList.forEach(function(reselt) {
              const products = reselt.products;
              products.forEach(function(res){
                  res.amount = parseInt(res.amount);
                  if (self.isLowThreshold(reselt.code)) {
                    res.min_investment = Math.max(res.min_investment, 1);
                  }
                  else {
                    res.min_investment = Math.max(res.min_investment, 100);
                  }

                  res.min_append = Math.max(res.min_append, 1);
              },this)
          }, this);
          this.groupsList = groupsList
        });
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.$ionicScrollDelegate = $ionicScrollDelegate;
        this.CommonService = CommonService;
        this.LoadingService = LoadingService;
        this.popupService = PopupService;
        this.mode = MODE.money;
    }

    getOrderedKeys(obj) {
        return _.sortBy(_.keys(obj), (k) => classList.indexOf(k));
    }

    getDonutData(asset_groups, total) {
        return _(this.getOrderedKeys(asset_groups))
            .map((k) => ({
                code: k.toUpperCase(),
                percentage: (asset_groups[k].amount - asset_groups[k].in_hand.amount) / total * 100,
                amount: asset_groups[k].amount - asset_groups[k].in_hand.amount,
                products:asset_groups[k].products,
                open:false,
                diff: 0
            }))
            //.filter((item) => item.percentage)
            .value();
    }

    changeMode(v) {
        if (this.mode != v) {
            this.mode = v;
        }
    }

    toggleGroup(group) {
      group.open = !group.open;
      this.$ionicScrollDelegate.resize();
    }

    isLowThreshold(assetClass) {
      return assetClass === 'PUBLIC_FUNDS' || assetClass === 'FINANCIAL_MANAGEMENT'
    }

    adjustAmount(group, product, isIncrease) {
      let increase = isIncrease ? 100 : -100;
      if (this.isLowThreshold(group.code)) {
        increase = isIncrease ? 1 : -1;
      }
      product.amount = +product.amount + increase;
      this.processAmountChange(group, product);
    }

    changeAmount(group, product) {
      this.$timeout(() => {
        product.amount = this.CommonService.roundMoney(product.amount);
        this.processAmountChange(group, product);
      }, 2000);
    }

    processAmountChange(group, product) {
      let isValid = true;
      let isNoDiff = this.checkGroupAmountDiff(group);
      if (!isNoDiff) {
        this.checkProductAmount(product);
        this.sendChange(false, null);
        return;
      }

      if (this.checkProductAmount(product)) {
        for(let tempProduct of group.products) {
          if (tempProduct != product && !this.checkProductAmount(tempProduct)) {
            this.sendChange(false, null);
            return;
          }
        }
      }
      else {
        this.sendChange(false, null);
        return;
      }

      let itemList = [];
      for(let group of this.groupsList) {
        if (group.code == 'EDUCATION_PROPERTY') {
          continue;
        }
        for(let product of group.products) {
          itemList.push({ product: product.product_id, amount: product.amount, percentage: product.amount / this.planningInvestment });
        }
      }

      this.sendChange(true, { item_list: itemList });
    }

    isPlaceholderProduct(product) {
      return product.is_placeholder == '1';
    }

    showProductPlaceholderTip() {
      this.popupService.showPlaceholderProductDescription();
    }

    checkGroupAmountDiff(group) {
      let totalAmount = 0;
      for(let product of group.products) {
        totalAmount += +product.amount;
      }

      group.diff = totalAmount - group.amount;

      return group.diff == 0;
    }

    checkProductAmount(product) {
      let result = true;
      let minInvestment = product.min_investment;
      let minAppend = product.min_append;
      if (product.amount < minInvestment) {
        let lessThanMinMsg = `${product.product_name}低于起投金额${minInvestment}万元`;
        this.LoadingService.showFailedLoading(lessThanMinMsg, 3000);
        result = false;
      }
      else {
        let addDiff = product.amount - minInvestment;
        if (Math.round(addDiff / minAppend) * minAppend != addDiff) {
          let appendInvalidMsg = `${product.product_name}起投金额${minInvestment}万元,以${minAppend}万元为单位递增`;
          this.LoadingService.showFailedLoading(appendInvalidMsg, 3000);
          result = false;
        }
      }

      return result;
    }

    sendChange(isValid, data) {
      this.$scope.$emit('portfolioProposal.change', isValid, data);
    }
}

const productCmp = {
    templateUrl: 'component/product-cmp.html',
    controller: ProductCmpCtrl,
    bindings: {
        data: '<',
    },
};

export default productCmp;
