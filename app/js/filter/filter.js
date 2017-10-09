import productFilter from './product';
import orderFilter from './order';

const moduleName = 'unicorn.filter';

angular.module(moduleName, [productFilter, orderFilter]);

export default moduleName;
