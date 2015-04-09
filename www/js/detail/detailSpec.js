describe('Detail Controller', function () {
  // declare variables
  var $rootScope;
  var $scope;
  var $ionicModal;
  var Caches;
  var $controller;
  var ctrl;

  // load the controller's module
  beforeEach(module('snapcache'));

  beforeEach(inject(function($injector) {
    // mock out our dependencies
    $rootScope = $injector.get('$rootScope');
    $ionicModal = $injector.get('$ionicModal');
    Caches = $injector.get('Caches');

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

});
