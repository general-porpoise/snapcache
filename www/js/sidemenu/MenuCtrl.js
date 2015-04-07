// Menu Controller
angular.module('snapcache.menu', [])

.controller('MenuCtrl', function($scope, $ionicModal) {

  // Create the create modal that we will use later
  $ionicModal.fromTemplateUrl('js/create/create.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the create modal to close it
  $scope.closeCreate = function() {
    $scope.modal.hide();
  };

  // Open the create modal
  $scope.create = function() {
    $scope.modal.show();
  };

});
