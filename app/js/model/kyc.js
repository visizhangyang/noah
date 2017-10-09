const ASSET_KEYS = [
	'FIXED_INCOME',
	'STOCK',
	'ALTERNATIVE',
	'CASH',
];

const DEFAULT = {
	risk_planning_invest: 1000,
	planning_invest: 1000,
	risk_investment_age: 'ONE_YEAR',
	risk_level: 1,
	retirement_age: 30,
}

export default class ClientKycModel {
	static get $inject() {
		return [
			'UserModel', '$q'
		];
	}

	constructor(UserModel, $q) {
		this.UserModel = UserModel;
		this.$q = $q;
		this.data = null;
	}

	getData() {

		// let risk_level = null;

		// return this.ClientModel.get(id).then(res => {
		// 	risk_level = res.data.risk_level;
		// 	return this.ClientModel.fetchAsset(this.client_id)
		// })

		this.data = _.assign({}, DEFAULT);

    return this.UserModel.fetchAsset().then((res) => {
      this.data = toKYCData(res.data);
      return {
        data: this.data,
      };
    }).catch(() => {
      return {
        data: this.data,
      };
    });
	}

	getAssetAllocation() {
		const { fixed_income, stock_asset, alternative_asset, cash_asset } = this.data;
		var assets = [
			{ "code": "FIXED_INCOME", "percentage": 0, "amount": fixed_income || 0 },
			{ "code": "STOCK", "percentage": 0, "amount": stock_asset || 0 },
			{ "code": "ALTERNATIVE", "percentage": 0, "amount": alternative_asset || 0 },
			{ "code": "CASH", "percentage": 0, "amount": cash_asset || 0 },
		]
		var total = _.sumBy(assets, p => p.amount);
		console.log(total)
		for (var item of assets) {
			item.percentage = item.amount / total * 100;
		}
				console.log(assets);

		return assets;
	}

	save(client_id, data) {
		const asset = _.omitBy(_.assign({ client_id: client_id }, data), _.isNil);
		asset.risk_planning_invest = asset.planning_invest;
		if (asset.client_risk_level) {
			asset.risk_level = asset.client_risk_level;
		}
		return this.UserModel.postAsset(asset);
	}
}

function toKYCData(data) {
	let {
		alternative_asset,
		annual_cost_after_retirement,
		annual_expenditure,
		annual_income,
		cash_asset,
		children_education_budget,
		fixed_income,
		health_insurance_coverage,
		liability,
		life_insurance_coverage,
		monthly_repayment,
		planning_invest,
		retirement_age,
		risk_investment_age,
		risk_level,
		risk_planning_invest,
		stock_asset,
		yearly_repayment,
       } = data;

	if (typeof(planning_invest) === 'string') {
		planning_invest = parseInt(planning_invest);
	}

	return {
		alternative_asset,
		annual_cost_after_retirement,
		annual_expenditure,
		annual_income,
		cash_asset,
		children_education_budget,
		fixed_income,
		health_insurance_coverage,
		liability,
		life_insurance_coverage,
		monthly_repayment,
		planning_invest,
		retirement_age,
		risk_investment_age,
		risk_level,
		risk_planning_invest,
		stock_asset,
		yearly_repayment,
	};
}

function toAllocation(allocation) {
	return _(allocation).keys()
		.map((k) => ({
			code: k.toUpperCase(),
			percentage: allocation[k][1] * 100,
			amount: allocation[k][0],
		}))
		.filter((item) => item.percentage > -1)
		.sortBy((k) => ASSET_KEYS.indexOf(k.code))
		.value();
}
