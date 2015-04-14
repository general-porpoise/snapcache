// Caches is a factory that gives functionality associated with getting
// a users caches (but contributable and received ones), and creating
// new ones.
angular.module('snapcache.services.caches', [])

.factory('Caches', function($q, FIREBASE_REF, userSession){
  var cachesRef = new Firebase(FIREBASE_REF).child('caches');
  var usersRef = new Firebase(FIREBASE_REF).child('users');

  return {
    getContributable: getContributable,
    getReceived: getReceived,
    getCacheDetails: getCacheDetails,
    getCacheDetailsForDiscovered: getCacheDetailsForDiscovered,
    onCacheDiscovered: onCacheDiscovered,
    create: create,
    discoverCache: discoverCache,
    removeCache: removeCache
  };

  // `getContributable()` will get the current user's caches that they can
  // contribute to from Firebase.
  function getContributable() {
    var id = userSession.uid;
    var deferred = $q.defer();
    usersRef.child(id).once('value', function(snapshot){
      var userData = snapshot.val();
      var contributableCaches = userData.contributableCaches;
      if (contributableCaches) {
        deferred.resolve(contributableCaches);
      } else {
        // If the user has no contributable caches, the promise will return
        // an empty object.
        deferred.reject({});
      }
    });
    return deferred.promise;
  }

  // `getReceived()` will simply get the current user's received caches from Firebase.
  // This current version does not do any type of geographic or temporal filtering,
  // but that will be added in the future.
  //
  // TODO: Add temporal and geographic filtering
  function getReceived() {
    var id = userSession.uid;
    var deferred = $q.defer();
    usersRef.child(id).once('value', function(snapshot){
      var userData = snapshot.val();
      var receivedCaches = userData.receivedCaches;
      if (receivedCaches) {
        deferred.resolve(receivedCaches);
      } else {
        // If the user has no received caches, the promise will return an
        // empty object.
        deferred.reject({});
      }
    });
    return deferred.promise;
  }

  // retrieves a specific cache's details from the collection
  function getCacheDetails(cacheID) {
    var deferred = $q.defer();
    cachesRef.child(cacheID).once('value', function (snapshot) {
      var cacheData = snapshot.val();

      // if the cache hasn't expired, set the promise's resolve to return it.
      if ( !isExpired(cacheData) ) {
        if (cacheData) {
          deferred.resolve(cacheData);
        } else {
          deferred.reject({});
        }
      // if the cache *has* expired, remove it
      } else {
        console.log('EXPIRED cache! Remove:', cacheID);
        removeCache(cacheID, cacheData);
      }
    });
    return deferred.promise;
  }

  // 'getCacheDetailsForDiscovered()' will take in a cache ID and retrieve that cache object if the cache has been discovered.
  function getCacheDetailsForDiscovered(cacheID) {
    // console.log('in getCacheDetailsForDiscovered', cacheID);
    var deferred = $q.defer();
    cachesRef.child(cacheID).once('value', function (snapshot) {
      var cacheData = snapshot.val();
      var discovered = cacheData.discovered;

      // if the cache hasn't expired, and has been discovered, set the promise's resolve to return it.
      if ( !isExpired(cacheData) ) {
        if (discovered) {
          deferred.resolve(cacheData);
        } else {
          deferred.reject();
        }
      // if the cache *has* expired, remove it
      } else {
        // console.log('EXPIRED cache! Remove:', cacheID);
        removeCache(cacheID, cacheData);
      }
    });
    return deferred.promise;
  }

  // Set listener on cache if not discovered, execute
  // callback when cache flagged as discovered in Firebase
  function onCacheDiscovered(cacheID) {
    var deferred = $q.defer();
    var cacheRef = cachesRef.child(cacheID);
    // set up listener on firebase ref
    cacheRef.on('child_changed', function(childSnapshot) {
      var isDiscovered = childSnapshot.val();
      if (childSnapshot.key() === 'discovered' && isDiscovered) {
        console.log(cacheID + ' has been discovered!');
        cacheRef.once('value', function(cacheSnapshot) {
          deferred.resolve(cacheSnapshot.val());
        });
      }
    });
    return deferred.promise;
  }

  // `create()` will take in an object of cache parameters and send that to Firebase.
  // In addition, it will add the associated cache id to the necessary users
  // (contributors and recipients).
  function create(cacheParams) {
    var newCacheRef = cachesRef.push(cacheParams);
    // Get the ID that Firebase will safe the cache at.
    var cacheID = newCacheRef.key();

    // Add the new cache's id to the contributing users inboxes.
    var contributors = cacheParams.contributors;
    for (var userID in contributors) {
      var cache = {};
      cache[cacheID] = true;
      usersRef.child(userID).child('contributableCaches').update(cache);
    }

    // Add the new cache's id to recipients receivedCaches in Firebase
    var recipients = cacheParams.recipients;
    for (var userID in recipients) {
      var cache ={};
      cache[cacheID] = true;
      usersRef.child(userID).child('receivedCaches').update(cache);
    }
  }

  // Toggles the discover flag on the indicated cache (in Firebase) and will
  // set the expiresAt property.
  function discoverCache(cacheID) {
    console.log('cacheID:', cacheID);
    var cacheRef = cachesRef.child(cacheID);

    // Get the cache from Firebase
    cacheRef.once('value', function(snapshot) {
      var cache = snapshot.val();
      if (cache.discovered === false) {
        // Calculate and set the expiresAt property
        var now = Date.now();
        var lifespan = cache.lifespan;
        var expiresAt = now + lifespan;
        // We pass in a callback that will only run once the `expiresAt` property
        // has been set. This ensures that when we mark discovered, the
        // updated cache will display the remaining cache time in the inbox.
        cacheRef.child('expiresAt').set(expiresAt, function(error){
          if (error) {
            console.log('unable to set expiresAt property');
          } else {
            // Set discovered to true
            console.log('cache:', cacheID,'has been discovered');
            cacheRef.child('discovered').set(true);
          }
        });
      }
    });
  }

  // 'removeCache' removes the cache ref from the contributors and recipients associated with it, and then removes the cache itself from Firebase.
  function removeCache(cacheID, cacheData) {
    // console.log('in removeCache', cacheData);
    var recipients = cacheData.recipients;
    var contributors = cacheData.contributors;

    for (var recipient in recipients) {
      // console.log('recipient', recipient);
      usersRef.child(recipient).child('receivedCaches').child(cacheID).remove();
    }
    for (var contributor in contributors) {
      // console.log('contributor', contributor);
      usersRef.child(contributor).child('contributableCaches').child(cacheID).remove();
    }
    cachesRef.child(cacheID).remove();
  }

  // 'isExpired' checks to see if the cache is past its expiry date/time
  function isExpired(cache) {
    var now = Date.now();
    if (cache.expiresAt <= now) {
      return true;
    } else {
      return false;
    }
  }
});
