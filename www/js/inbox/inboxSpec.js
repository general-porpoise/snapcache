xdescribe('Inbox Controller', function () {
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
    ctrl = $controller('InboxCtrl', {
      self: scope
    });
  }));

  // after each

  // tests
  it('should exist', function () {
    expect(ctrl).toEqual(jasmine.anything());
  });

  it('should have a caches property', function () {
    expect(ctrl.caches).toBeDefined();
  });

  describe('displayCaches', function () {
    it('should exist', function () {
      expect(ctrl.displayCaches).toEqual(jasmine.anything());
    });

    it('should be a function', function () {
      expect(typeof ctrl.displayCaches).toEqual('function');
    });

    // it('should do XXXXX');
  });
});
