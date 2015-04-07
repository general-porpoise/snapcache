// Create Controller
angular.module('snapcache.create', [])

.controller('CreateCtrl', function($ionicModal) {

  var self = this;

  self.properties = {};

  self.submitNewCache = function() {
    console.log('New cache submitted');
  };

  // Create the map modal that we will use later
  $ionicModal.fromTemplateUrl('js/create/map.html', {
    scope: self
  }).then(function(modal) {
    self.modal = modal;
  });

  // Triggered in the map modal to close it
  self.closeMap = function() {
    self.modal.hide();
  };

  // Open the map modal
  self.map = function() {
    console.log('getting location');
    self.modal.show();
  };

});
