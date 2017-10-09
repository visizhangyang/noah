
class SliderCtrl {
  static get $inject() {
    return ['$scope', '$ionicScrollDelegate'];
  }

  constructor($scope, $ionicScrollDelegate) {
    this.offsetWidth = null;
    this.$ionicScrollDelegate = $ionicScrollDelegate;
    this.adjustMinStyle = { left: `${this.adjustMinRange}%` };

    $scope.$watch(() => this.value, (newV) => {
      this.setStyles(null, newV);
    });
  }

  setStyles(offsetX, p) {
    let offset = 0;
    if (p) {
      offset = p;
    } else {
      offset = (offsetX - 30) / this.offsetWidth * 100;
    }
    if (offset < 0) {
      offset = 0;
    } else if (offset > 100) {
      offset = 100;
    }

    if (this.adjustMinRange && offset < this.adjustMinRange) {
      offset = this.adjustMinRange;
    }

    if (!p) {
      this.onUpdate({ range: offset });
    }

    this.indicatorStyle = {
      'background-image': `linear-gradient(90deg, #DBDBDB 2%, #693F3E ${offset}%,
           transparent ${offset + 1}%, transparent 100%),
         linear-gradient(90deg, #f3f3f3 49%, #ddd 100%)`,
    };
    this.thumbStyle = { left: `${offset}%` };
  }

  checkOffset(e) {
    if (!this.offsetWidth) {
      const container = ionic.DomUtil.getParentOrSelfWithClass(e.target, 'slide-container');
      this.offsetWidth = container.offsetWidth;
      return true;
    }

    return !!this.offsetWidth;
  }

  onDrag(e) {
    const ready = this.checkOffset(e);
    this.showTip = true;
    if (!ready) {
      return;
    }
    const position = e.gesture.center;
    this.setStyles(position.pageX);
    this.$ionicScrollDelegate.freezeScroll(true);
  }

  onTap(e) {
    const ready = this.checkOffset(e);
    if (!ready) {
      return;
    }
    const position = e.gesture.center;
    this.setStyles(position.pageX);
  }

  onRelease() {
    this.showTip = false;
    this.$ionicScrollDelegate.freezeScroll(false);
  }
}

const SliderCmp = {
  templateUrl: 'component/slider.html',
  controller: SliderCtrl,
  bindings: {
    onUpdate: '&',
    value: '<',
    adjustMinRange: '<',
    tip: '<',
  },
};

export default SliderCmp;
