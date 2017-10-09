import * as d3 from 'd3';

const moduleName = 'unicorn.component.riskReturnGraph';

class RiskReturnGraph {

  constructor(node) {
    this.winG = d3.select(node).selectAll('g:first-child');
    this.volatilityG = d3.select(node).selectAll('g:last-child');

    let outerRadius = 43;
    let arcThickness = 4;
    let cornerRadius = 3;

    this.arc = d3.arc()
      .outerRadius(outerRadius)
      .innerRadius(outerRadius - arcThickness)
      .cornerRadius(cornerRadius)
      .startAngle(0);
  }

  draw(riskLevel) {
    this.winG.selectAll('path').remove();
    this.volatilityG.selectAll('path').remove();

    let riskLevelRatio = riskLevel / 10;
    this.drawArc(this.winG, riskLevelRatio);
    this.drawArc(this.volatilityG, riskLevelRatio * 0.6);
  }

  drawArc(g, ratio) {
    let endAngle = ratio * (Math.PI * 2 * 0.75);
    this.arc.endAngle(endAngle);

    g.append('path')
      .attr('d', this.arc);
  }

}

function RiskReturnGraphFactory() {
  return RiskReturnGraph;
}

RiskReturnGraphFactory.$inject = [];

function riskReturnGraph(RiskReturnGraphFactory) {
  return {
    scope: {
      riskLevel: '<',
      win: '<',
      volatility: '<',
    },
    templateUrl: 'component/risk-return-graph.html',
    link: function ($scope, $el) {
      const el = $el[0];
      const riskReturnGraph = new RiskReturnGraphFactory(el);
      $scope.$watch(() => $scope.riskLevel, (newV) => {
        if (!newV) { return; }
        riskReturnGraph.draw(newV);
      });
    }
  };
}

riskReturnGraph.$inject = ['RiskReturnGraphFactory'];

angular.module(moduleName, [])
  .factory('RiskReturnGraphFactory', RiskReturnGraphFactory)
  .directive('riskReturnGraph', riskReturnGraph);

export default moduleName;
