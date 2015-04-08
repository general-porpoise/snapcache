// Caches is a factory that gives functionality associated with getting
// a users caches (but contributable and received ones), and creating
// new ones.
angular.module('snapcache.services.caches', [])

.factory('Caches', function(FIREBASE_REF, userSession){
  var cachesRef = new Firebase(FIREBASE_REF).child('caches');
  var usersRef = new Firebase(FIREBASE_REF).child('users');

  return {
    getContributable: getContributable,
    getReceived: getReceived,
    create: create
  };

  // `getContributable()` will get the current user's caches that they can
  // contribute to from Firebase.
  function getContributable(id, callback) {
    usersRef.child(id).once('value', function(snapshot){
      var userData = snapshot.val();
      var contributableCaches = userData.contributableCaches;
      if (contributableCaches) {
        callback(contributableCaches);
      } else {
        callback('no caches available');
      }
    });
  }

  // `getReceived()` will simply get the current user's received caches from Firebase.
  // This current version does not do any type of geographic or temporal filtering,
  // but that will be added in the future.
  //
  // TODO: Add temporal and geographic filtering
  function getReceived(id, callback) {
    usersRef.child(id).once('value', function(snapshot){
      var userData = snapshot.val();
      var receivedCaches = userData.receivedCaches;
      if (receivedCaches) {
        callback(receivedCaches);
      } else {
        callback('no caches available');
      }
    });
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
      var cache = {}
      cache[cacheID] = true;
      usersRef.child(userID).child('contributableCaches').set(cache);
    }

    // Add the new cache's id to recipients receivedCaches in Firebase
    var recipients = cacheParams.recipients;
    for (var userID in recipients) {
      var cache ={};
      cache[cacheID] = true;
      usersRef.child(userID).child('receivedCaches').set(cache);
    }
  }
});
