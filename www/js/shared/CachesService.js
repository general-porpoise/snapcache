// Caches is a factory that gives functionality associated with getting
// a users caches (contributable and received ones), and creating
// new ones.
angular.module('snapcache.services.caches', [])

.factory('Caches', function($q, FIREBASE_REF, userSession){
  var cachesRef = new Firebase(FIREBASE_REF).child('caches');
  var usersRef = new Firebase(FIREBASE_REF).child('users');

  return {
    getReceived: getReceived,
    getCacheDetails: getCacheDetails,
    getCacheDetailsForDiscovered: getCacheDetailsForDiscovered,
    onCacheDiscovered: onCacheDiscovered,
    create: create,
    addContribution: addContribution,
    addContributor: addContributor,
    discoverCache: discoverCache,
    removeCache: removeCache
  };

  // `getReceived()` will simply get the current user's received caches from Firebase.
  // It returns a promise that contains the cache object.
  function getReceived() {
    var id = userSession.uid;
    var deferred = $q.defer();
    usersRef.child(id).once('value', function(snapshot){
      var userData = snapshot.val();
      var receivedCaches = userData.receivedCaches;
      if (receivedCaches) {
        deferred.resolve(receivedCaches);
      } else {
        deferred.reject({});
      }
    });
    return deferred.promise;
  }

  // Retrieves a specific cache's details from the collection.
  function getCacheDetails(cacheID) {
    var deferred = $q.defer();
    cachesRef.child(cacheID).once('value', function (snapshot) {
      var cacheData = snapshot.val();

      // If the cache hasn't expired, set the promise's resolve to return it.
      if ( !isExpired(cacheData) ) {
        if (cacheData) {
          deferred.resolve(cacheData);
        } else {
          deferred.reject({});
        }
      } else {
        removeCache(cacheID, cacheData);
      }
    });
    return deferred.promise;
  }

  // 'getCacheDetailsForDiscovered()' will take in a cache ID and retrieve that
  // cache object if the cache has been discovered.
  function getCacheDetailsForDiscovered(cacheID) {
    var deferred = $q.defer();
    cachesRef.child(cacheID).once('value', function (snapshot) {
      var cacheData = snapshot.val();
      var discovered = cacheData.discovered;

      // If the cache hasn't expired, and has been discovered, set the promise's
      // resolve to return it.
      if ( !isExpired(cacheData) ) {
        if (discovered) {
          deferred.resolve(cacheData);
        } else {
          deferred.reject({});
        }
      } else {
        removeCache(cacheID, cacheData);
      }
    });
    return deferred.promise;
  }

  // Set listener on cache, execute callback when
  // cache flagged as discovered in Firebase.
  function onCacheDiscovered(cacheID) {
    var deferred = $q.defer();
    var cacheRef = cachesRef.child(cacheID);
    // Set up listener on Firebase ref.
    cacheRef.on('child_changed', function(childSnapshot) {
      var isDiscovered = childSnapshot.val();
      if (childSnapshot.key() === 'discovered' && isDiscovered) {
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

    // Get the ID that Firebase will save the cache at.
    var cacheID = newCacheRef.key();

    // Add the new cache's id to the contributing users inboxes.
    var contributors = cacheParams.contributors;
    for (var userID in contributors) {
      var cache = {};
      cache[cacheID] = false;
      usersRef.child(userID).child('contributableCaches').update(cache);
    }

    // Add the new cache's id to recipient's receivedCaches in Firebase.
    var recipients = cacheParams.recipients;
    for (var userID in recipients) {
      var cache ={};
      cache[cacheID] = true;
      usersRef.child(userID).child('receivedCaches').update(cache);
    }
  }

  // `addContribution()` is used to add additional data to a cache.
  function addContribution(cacheID, contribution) {
    var contentsRef = cachesRef.child(cacheID).child('contents');
    contentsRef.push(contribution);
  }

  // `addContributor() is used to add additional contributors to a cache,
  // thereby giving them the ability to read and write to that cache.
  function addContributor(cacheID, contributorID) {

    // First, add the contributor to the correct cache.
    var cacheRef = cachesRef.child(cacheID);
    var contributor = {};
    contributor[contributorID] = true;
    cacheRef.child('contributors').update(contributor);

    // Next, add the cacheID to that contributor's contributableCaches.
    var userRef = usersRef.child(contributorID);
    var cache = {};
    cache[cacheID] = false;
    userRef.child('contributableCaches').update(cache);
  }

  // Toggles the discover flag on the indicated cache (in Firebase) and will
  // set the expiresAt property.
  function discoverCache(cacheID) {
    var cacheRef = cachesRef.child(cacheID);

    // Get the cache from Firebase.
    cacheRef.once('value', function(snapshot) {
      var cache = snapshot.val();
      if (cache.discovered === false) {
        // Calculate and set the expiresAt property.
        var now = Date.now();
        var lifespan = cache.lifespan;
        var expiresAt = now + lifespan;
        // We pass in a callback that will only run once the `expiresAt` property
        // has been set. This ensures that when we mark discovered, the
        // updated cache will display the remaining cache time in the inbox.
        cacheRef.child('expiresAt').set(expiresAt, function(error){
          if (error) {
            console.error('unable to set expiresAt property:', error);
          } else {
            cacheRef.child('discovered').set(true);
          }
        });
      }
    });
  }

  // 'removeCache' removes the cache ref from the contributors and recipients
  // associated with it, and then removes the cache itself from Firebase.
  function removeCache(cacheID, cacheData) {
    var recipients = cacheData.recipients;
    var contributors = cacheData.contributors;

    for (var recipient in recipients) {
      usersRef.child(recipient).child('receivedCaches').child(cacheID).remove();
    }
    for (var contributor in contributors) {
      usersRef.child(contributor).child('contributableCaches').child(cacheID).remove();
    }
    cachesRef.child(cacheID).remove();
  }

  // 'isExpired' checks to see if the cache is past its expiry date/time.
  function isExpired(cache) {
    var now = Date.now();
    if (cache.expiresAt <= now) {
      return true;
    } else {
      return false;
    }
  }
});
