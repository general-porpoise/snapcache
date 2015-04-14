describe('Create Controller', function() {
  var $controller;
  var $rootScope;
  var $scope;

  // load the controller's module
  beforeEach(module('snapcache'));

  beforeEach(inject(function($injector) {
    // mock our dependencies
    $rootScope = $injector.get('$rootScope');

    // create controller for testing
    $controller = $injector.get('$controller');
    ctrl = $controller('CreateCtrl', {
      $scope: $rootScope.$new(),
      self: $scope
    });
  }));

  it('should exist', function() {
    expect(ctrl).toEqual(jasmine.anything());
  });

  it('should have a properties property', function() {
    expect(ctrl.properties).toBeDefined();
  });

  describe('convertDateTime', function() {
    it('should exist', function() {
      expect(ctrl.convertDateTime).toBeDefined();
    });

    it('should be a function', function() {
      expect(typeof ctrl.convertDateTime).toEqual('function');
    });
  });

  describe('search', function() {
    it('should exist', function() {
      expect(ctrl.search).toBeDefined();
    });

    it('should be a function', function() {
      expect(typeof ctrl.search).toEqual('function');
    });
  });

  describe('addRecipient', function() {
    it('should exist', function() {
      expect(ctrl.addRecipient).toBeDefined();
    });

    it('should be a function', function() {
      expect(typeof ctrl.addRecipient).toEqual('function');
    });
  });

  describe('submitNewCache', function() {
    it('should exist', function() {
      expect(ctrl.submitNewCache).toBeDefined();
    });

    it('should be a function', function() {
      expect(typeof ctrl.submitNewCache).toEqual('function');
    });
  });

  xdescribe('showMap', function() {
    it('should exist', function() {
      expect(ctrl.showMap).toBeDefined();
    });

    it('should be a function', function() {
      expect(typeof ctrl.showMap).toEqual('function');
    });

    it('should close the map', function() {
      ctrl.showMap();
      expect(ctrl.mapModal.isShown()).toEqual(true);
    });
  });

  xdescribe('closeMap', function() {
    it('should exist', function() {
      expect(ctrl.closeMap).toBeDefined();
    });

    it('should be a function', function() {
      expect(typeof ctrl.closeMap).toEqual('function');
    });

    it('should close the map', function() {
      ctrl.showMap();
      ctrl.closeMap();
      expect(ctrl.mapModal.isShown()).toEqual(false);
    });
  });

  // test for initializeMap
});
