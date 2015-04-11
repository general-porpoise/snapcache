// Geofire service contains the functionality
// necessary for the app to find which snapcaches
// a user is in the vicinity of
angular.module('snapcache.services.geofire', [])

.factory('Geofire', function(FIREBASE_REF, userSession, Caches) {
  var geofire = new GeoFire(new Firebase(FIREBASE_REF + 'geofire/'));
  var cachesRef = new Firebase(FIREBASE_REF + 'caches/');

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
      cachesRef.child(id).once('value', function(snapshot) {
        console.log('snapshot:', snapshot.val());
        var cacheObj = snapshot.val();
        var geoQuery = geofire.query({
          center: [cacheObj.coordinates.latitude, cacheObj.coordinates.longitude],
          //radius: cacheObj.radius //kilometers
          radius: 1.62
        });
        // set geofire query listener on each
        geoQuery.on('key_entered', function(key, location, distance) {
          console.log('key entered radius!');
          // query listener (key-entered) response:
          // check if key refers to user, do nothing if not
          if (key !== userSession.uid) return;
          console.log('user key:', key);
          var now = Date.now();
          var droptime = cacheObj.droptime;
          var lifespan = cacheObj.lifespan;
          console.log('now:', now);
          console.log('droptime:', droptime);
          console.log('droptime+lifespan:', droptime+lifespan);
          // check if cache is available to be discovered
          if (now > droptime &&
             (now < (droptime + lifespan)) &&
              !cacheObj.discovered) {
            // set cache state to discovered
            Caches.discoverCache(id);
            alert('new cache discovered!' + cacheObj.discovered);
          }
        });
      });
    }
  };

  return {
    setListeners: setListeners,
    geofire: geofire
  };

});
