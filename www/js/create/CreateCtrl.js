// Create Controller
angular.module('snapcache.create', [])

.controller('CreateCtrl', function($scope, $ionicModal) {

  $scope.properties = {};

  $scope.submitNewCache = function() {
    console.log('New cache submitted');
  };

  // Create the map modal that we will use later
  $ionicModal.fromTemplateUrl('js/create/map.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the map modal to close it
  $scope.closeMap = function() {
    $scope.modal.hide();
  };

  // Open the map modal
  $scope.map = function() {
    console.log('getting location');
    $scope.modal.show();
  };

});
