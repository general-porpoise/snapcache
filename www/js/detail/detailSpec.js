describe('Detail Controller', function () {
  // declare variables
  var $controller;

  // load the controller's module
  beforeEach(module('snapcache'));

  beforeEach(inject(function($injector) {
    // mock out our dependencies
    $rootScope = $injector.get('$rootScope');
    scope = $rootScope.$new();

    // create controller for testing
    $controller = $injector.get('$controller');
    ctrl = $controller('DetailCtrl', {
      self: scope
    });
  }));

  // after each

  // tests
  it('should exist', function () {
    expect(ctrl).toEqual(jasmine.anything());
  });

});
