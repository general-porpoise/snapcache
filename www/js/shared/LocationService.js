// Location is a factory that gives functionality associated with getting
// a users caches (but contributable and received ones), and creating
// new ones.
angular.module('snapcache.services.location', [])

.factory('Location', function($q){

  return {
    getAddress: getAddress
  };

  // `getAddress()` takes a latitude and longitude and will use the Google
  // Maps API in order to identify the human-readable location associated
  // with that position.
  function getAddress(lat, lon) {
    // Setting up a promise since the call to Google Maps API will be
    // asynchronous.
    var deferred = $q.defer();

    console.log('Requesting human-readable location');
    var geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(lat, lon);

    // Request reverse geocode from geocoder
    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        // self.geocodingTimeout = Date.now() + 20000;
        if (results[0]) {
          // store the human-readable
          console.log('HUMAN READABLE ADDRESS:', results[0]);
          deferred.resolve(results[0].formatted_address);
        } else {
          deferred.resolve("Unknown");
        }
      } else {
        deferred.reject('Error in reverse geocoding');
      }
    });

    // Return the promise associated with the API call.
    return deferred.promise;
  }
});
