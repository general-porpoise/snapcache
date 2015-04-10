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
      // get human-readable location (address), throttled
      // to 1 request per 20 seconds
      if (Date.now() > self.geocodingTimeout) {
        self.getAddress();
      }
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

  // Timeout used to throttle geocoding requests
  self.geocodingTimeout = Date.now();

  // Get reverse geocoding from lat/lng coords for
  // human-readable location
  self.getAddress = function() {
    console.log('Requesting human-readable location');
    var geocoder = new google.maps.Geocoder();
    var lat = userSession.position.coords.latitude;
    var lng = userSession.position.coords.longitude;
    var latlng = new google.maps.LatLng(lat, lng);
    // request reverse geocode from geocoder
    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        self.geocodingTimeout = Date.now() + 20000;
        if (results[0]) {
          // store the human-readable
          self.readable_location = results[0].formatted_address;
          userSession.readable_location = self.readable_location;
        } else {
          console.log('No human-readable location found');
        }
      } else {
        // If we receive an error status, delay future geocoding request
        self.geocodingTimeout = Date.now() + 40000;
        self.readable_location = undefined;
        userSession.readable_location = undefined;
        alert('Geocoder failed due to: ' + status);
      }
    });
  };

});
