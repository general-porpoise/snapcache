// Create Controller
angular.module('snapcache.create', [])

.controller('CreateCtrl', function($scope, $ionicModal) {
  
  $scope.submitNewCache = function() {
    console.log('New cache submitted');
  };

});
