// Location is a factory that gives functionality associated with getting
// a users caches (both contributable and received ones), and creating
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
    var deferred = $q.defer();

    var geocoder = new google.maps.Geocoder();
    var latlng = new google.maps.LatLng(lat, lon);

    // Request reverse geocode from geocoder.
    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          deferred.resolve(results[0]);
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
