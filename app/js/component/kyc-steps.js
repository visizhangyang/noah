import * as d3 from 'd3';

const moduleName = 'unicorn.component.kycSteps';

class KycSteps {

  constructor(node) {
    this.stepsG = [];
    for(let i = 0; i < 5; i++) {
      this.stepsG.push(d3.select(node).select('g#step' + (i + 1)))
    }

    this.placeHolderG = d3.select(node).select('g.place-holder');
  }

  draw(currentStep) {
    // reset g of each step
    for(let i = 0; i < 5; i++) {
      let g = this.stepsG[i];
      g.html('');
      g.classed('done current to-do', false);
    }

    for(let i = 0; i < currentStep - 1; i++) {
      let g = this.stepsG[i];
      g.classed('done', true);
      this.appendCircle(g, 30);
      let newPath = this.placeHolderG.select('path').node().cloneNode();
      g.node().appendChild(newPath);
    }

    for(let i = currentStep - 1; i < 5; i++) {
      let g = this.stepsG[i];
      if (i == currentStep - 1) {
        g.classed('current', true);
        this.appendCircle(g, 30);
      }
      else {
        g.classed('to-do', true);
        this.appendCircle(g, 29);
      }

      g.append('text').append('tspan')
        .attr('x', 25.01)
        .attr('y', 38)
        .text(i + 1);
    }
  }

  appendCircle(g, r) {
    g.append('circle')
      .attr('cx', 30)
      .attr('cy', 30)
      .attr('r', r);
  }

}

function KycStepsFactory() {
  return KycSteps;
}

KycStepsFactory.$inject = [];

function KycStepsDirective(KycStepsFactory) {
  return {
    scope: {
      currentStep: '<step'
    },
    templateUrl: 'component/kyc-steps.html',
    link: function ($scope, $el) {
      const el = $el[0];
      const kycSteps = new KycStepsFactory(el);
      $scope.$watch(() => $scope.currentStep, (newV) => {
        if (!newV) { return; }
        kycSteps.draw(newV);
      });
    }
  };
}

KycStepsDirective.$inject = ['KycStepsFactory'];

angular.module(moduleName, [])
  .factory('KycStepsFactory', KycStepsFactory)
  .directive('kycSteps', KycStepsDirective);

export default moduleName;
