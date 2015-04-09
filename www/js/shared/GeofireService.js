// Geofire service contains the functionality
// necessary for the app to find which snapcaches
// a user is in the vicinity of
angular.module('snapcache.services.geofire', [])

.factory('Geofire', function(FIREBASE_REF, userSession, Caches) {
  var geofire = new GeoFire(new Firebase(FIREBASE_REF + 'geofire/'));

  // userSession object contains user's "uid" for the current session

  var setListeners = function(caches) {
    if (userSession.uid === undefined) {
      console.log('User is not logged in');
      return;
    }
    console.log('caches:', caches);
    // iterate over recipientOf caches for current user
    for (var id in caches) {
    // caches.forEach(function(cache) {
      var geoQuery = geoFire.query({
        center: [caches[id].coordinates.lat, caches[id].coordinates.long],
        radius: caches[id].radius //kilometers
      });
      // set geofire query listener on each
      geoQuery.on('key_entered', function(key, location, distance) {
        // query listener (key-entered) response:
        // TODO: check if key refers to user
        var now = Date.now();
        var availDate = caches[id].availDate;
        var lifespan = caches[id].lifespan;
        // check if cache is available to be discovered
        if (now > availDate &&
           (now + lifespan) < (availDate + lifespan &&
            !caches[id].discovered)) {
          // alert user to discovered cache
          // set cache state to discovered
          Caches.discoverCache(id);
          // add cache to inbox
        }
      });
    }
  };

  return {
    setListeners: setListeners,
    geofire: geofire
  };

});
