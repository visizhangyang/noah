export default class CommonService {

  constructor() {
  }

  roundMoney(value) {
    let result = value;
    if (result && /\d+\.\d+/.test(result)) {
      result = Math.round(result);
    }
    return result;
  }

  convertStringFieldsToInt(targetObject, fields) {
    for(let field of fields) {
      if (typeof(targetObject[field]) === 'string') {
        targetObject[field] = parseInt(targetObject[field]);
      }
    }
  }

}

CommonService.$inject = [];
