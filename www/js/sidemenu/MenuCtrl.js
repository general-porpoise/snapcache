// Menu Controller
angular.module('snapcache.menu', [])

.controller('MenuCtrl', function($scope, $ionicModal, userSession, Geofire) {

  var self = this;


  // Triggered in the create modal to close it
  self.closeCreate = function() {
    self.createModal.remove();
  };

  // Open the create modal
  self.create = function() {
    // Create the create modal that we will use later
    $ionicModal.fromTemplateUrl('js/create/create.html', {
      scope: $scope
    }).then(function(modal) {
      self.createModal = modal;
      self.createModal.show();
    });
  };

  var watchID;

  // watch user's position, store in userSession and update GeoFire
  $scope.$on('$ionicView.beforeEnter', function() {
    watchID = navigator.geolocation.watchPosition(function(pos) {
      console.log('current position:', pos);
      userSession.position = pos;
      console.log(userSession.uid);
      Geofire.geofire.set(userSession.uid, [
        pos.coords.latitude,
        pos.coords.longitude
      ]).then(function() {
        console.log("Key set in GeoFire");
      }, function(error) {
        console.log("Error: " + error);
      });
    });
  });

  // remove user from geofire when we leave the inbox view
  $scope.$on('$ionicView.beforeLeave', function() {
    console.log('clearing watch for user position');
    // stop watching user's position
    navigator.geolocation.clearWatch(watchID);
    // remove user from geofire
    Geofire.geofire.remove(userSession.uid);
  });  

});
