// Geofire service contains the functionality
// necessary for the app to find which snapcaches
// a user is in the vicinity of
angular.module('snapcache.services.geofire', [])

.factory('Geofire', function(FIREBASE_REF, userSession, Caches) {
  var geofire = new GeoFire(new Firebase(FIREBASE_REF + 'geofire/'));
  var cachesRef = new Firebase(FIREBASE_REF + 'caches/');

  // `setListener()` sets a geofire query to determine if the user
  // enters a particular cache's radius.
  var setListener = function(cacheID) {
    cachesRef.child(cacheID).once('value', function(snapshot) {
      var cacheObj = snapshot.val();
      var geoQuery = geofire.query({
        center: [cacheObj.coordinates.latitude, cacheObj.coordinates.longitude],
        radius: cacheObj.radius
      });

      // Setting the listener.
      geoQuery.on('key_entered', function(key, location, distance) {
        if (key !== userSession.uid) return;

        // Sets the cache to discovered if time conditions are met.
        cachesRef.child(cacheID).child('discovered').once('value', function(freshSnapshot) {
          var isDiscovered = freshSnapshot.val();

          var now = Date.now();
          var droptime = cacheObj.droptime;
          var lifespan = cacheObj.lifespan;
          // Check if cache is available to be discovered.
          if ((now > droptime) &&
             (now < (droptime + lifespan)) &&
             (!isDiscovered)) {
            // Set cache state to discovered.
            Caches.discoverCache(cacheID);
          }
        });
      });
      // Remove geoquery listener when cache removed.
      cachesRef.on('child_removed', function(childSnapshot) {
        if (childSnapshot.key() === cacheID) {
          geoQuery.cancel();
        }
      });
    });
  };

  return {
    setListener: setListener,
    geofire: geofire
  };

});
