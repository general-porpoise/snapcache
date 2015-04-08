// Menu Controller
angular.module('snapcache.menu', [])

.controller('MenuCtrl', function($scope, $ionicModal) {

  // Create the create modal that we will use later
  $ionicModal.fromTemplateUrl('js/create/create.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.createModal = modal;
  });

  // Triggered in the create modal to close it
  $scope.closeCreate = function() {
    $scope.createModal.hide();
  };

  // Open the create modal
  $scope.create = function() {
    $scope.createModal.show();
  };

  $scope.properties = {};

  $scope.submitNewCache = function() {
    console.log('New cache submitted');
  };

  // Create the map modal that we will use later
  $ionicModal.fromTemplateUrl('js/create/map.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.mapModal = modal;
  });

  // Triggered in the map modal to close it
  $scope.closeMap = function() {
    $scope.mapModal.hide();
  };

  // Open the map modal
  $scope.map = function() {
    console.log('getting location');
    $scope.mapModal.show();
  };

});
