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
    create: create,
    discoverCache: discoverCache
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
      if (cacheData) {
        deferred.resolve(cacheData);
      } else {
        deferred.reject({});
      }
    });
    return deferred.promise;
  }

  // 'getCacheDetailsForDiscovered()' will take in a cache ID and retrieve that cache object if the cache has been discovered.
  function getCacheDetailsForDiscovered(cacheID) {
    var deferred = $q.defer();
    cachesRef.child(cacheID).once('value', function (snapshot) {
      var cacheData = snapshot.val();
      var discovered = cacheData.discovered;

      if (discovered) {
        deferred.resolve(cacheData);
      } else {
        deferred.reject(); // what to return if not discovered
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

  // toggles the discover flag on the indicated cache (in Firebase)
  function discoverCache(cacheID) {
    cachesRef.child(cacheID + '/discovered').set(true);
  }
});
