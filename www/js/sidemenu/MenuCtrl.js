// Menu Controller
angular.module('snapcache.menu', [])

.controller('MenuCtrl', function($scope, $ionicModal, userSession, Geofire) {

  var self = this;
  self.position;

  // Triggered in the create modal to close it
  self.closeCreate = function() {
    self.createModal.remove();
  };

  // Open the create modal
  self.create = function() {
    // Create and then show the create modal
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
      self.position = pos;
      console.log(userSession.uid);
      // get human-readable location (address)
      self.getAddress();
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

  // Get reverse geocoding from lat/lng coords for
  // human-readable location
  self.getAddress = function() {
    // do geocoding here...
    var geocoder = new google.maps.Geocoder();
    var lat = userSession.position.coords.latitude;
    var lng = userSession.position.coords.longitude;
    var latlng = new google.maps.LatLng(lat, lng);
    // request reverse geocode from geocoder
    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          // store the human-readable
          self.readable_location = results[0].formatted_address;
        } else {
          console.log('No human-readable location found');
        }
      } else {
        alert('Geocoder failed due to: ' + status);
      }
    });
  };

});
