describe('Create Controller', function() {
  var $controller;

  // load the controller's module
  beforeEach(module('snapcache'));

  beforeEach(inject(function($injector) {
    // mock our dependencies

    // create controller for testing
    $controller = $injector.get('$controller');
    ctrl = $controller('CreateCtrl', {
      self: scope
    });
  }));

  it('should exist', function() {
    expect(ctrl.toExist());
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

  describe('showMap', function() {
    it('should exist', function() {
      expect(ctrl.showMap).toBeDefined();
    });

    it('should be a function', function() {
      expect(typeof ctrl.showMap).toEqual('function');
    });

    it('should close the map', function() {
      ctrl.mapModal.showMap();
      expect(ctrl.mapModal.isShown()).toEqual(true);
    });
  });

  describe('closeMap', function() {
    it('should exist', function() {
      expect(ctrl.closeMap).toBeDefined();
    });

    it('should be a function', function() {
      expect(typeof ctrl.closeMap).toEqual('function');
    });

    it('should close the map', function() {
      ctrl.mapModal.showMap();
      ctrl.mapModal.closeMap();
      expect(ctrl.mapModal.isShown()).toEqual(false);
    });
  });

  // test for initializeMap
});
