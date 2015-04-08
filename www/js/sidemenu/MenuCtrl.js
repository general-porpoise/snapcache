// Menu Controller
angular.module('snapcache.menu', [])

.controller('MenuCtrl', function($scope, $ionicModal) {

  var self = this;

  // Create the create modal that we will use later
  $ionicModal.fromTemplateUrl('js/create/create.html', {
    scope: $scope
  }).then(function(modal) {
    self.createModal = modal;
  });

  // Triggered in the create modal to close it
  self.closeCreate = function() {
    self.createModal.hide();
  };

  // Open the create modal
  self.create = function() {
    self.createModal.show();
  };

});
