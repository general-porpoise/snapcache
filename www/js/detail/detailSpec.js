describe('Detail Controller', function () {
  // declare variables
  var userSession;
  var $rootScope;
  var $scope;
  var $controller;
  var ctrl;

  // load the controller's module
  beforeEach(module('snapcache'));

  beforeEach(inject(function($injector) {
    // mock out our dependencies
    userSession = $injector.get('userSession');
    userSession.currentCache = {};
    $rootScope = $injector.get('$rootScope');

    // create controller for testing
    $controller = $injector.get('$controller');
    ctrl = $controller('DetailCtrl', {
      $scope: $rootScope.$new(),
      self: $scope
    });
  }));

  // after each

  // tests
  it('should exist', function () {
    expect(ctrl).toEqual(jasmine.anything());
  });

  it('should have a cache property', function () {
    expect(ctrl.cache).toBeDefined();
  });

});
