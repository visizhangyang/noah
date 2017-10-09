import { PROPERTY_DESC, PLACEHOLDER_PRODUCT_DESC } from '../data/description_text';

const propertyDescTemplateUrl = 'factory/property-desc.html';
const placeholderProductDescTemplateUrl = 'factory/placeholder-product-desc.html';


export default class PopupService {
  constructor($q, $log, $rootScope, $ionicPopup) {
    this.$rootScope = $rootScope;
    this.$ionicPopup = $ionicPopup;
    this.$log = $log;
    this.q = $q;

    this.descriptionScope = this.$rootScope.$new(true);
  }

  showPropertyDescription() {
    this.descriptionScope.propertyDesc = PROPERTY_DESC;
    this.descriptionScope.close = () => { this.popup.close(); };
    this.popup = this.$ionicPopup.alert({
    scope: this.descriptionScope,
    title: '资产分类定义',
    templateUrl: propertyDescTemplateUrl,
    buttons: [] 
    });
  }

  showPlaceholderProductDescription() {
    this.descriptionScope.placeholderProductDesc = PLACEHOLDER_PRODUCT_DESC;
    this.descriptionScope.close = () => { this.popup.close(); };
    this.popup = this.$ionicPopup.alert({
    scope: this.descriptionScope,
    title: PLACEHOLDER_PRODUCT_DESC.title,
    templateUrl: placeholderProductDescTemplateUrl,
    buttons: [] 
    });
  }
}
PopupService.$inject = ['$q', '$log', '$rootScope', '$ionicPopup'];
