var firebaseServices = angular.module('snapcache.services.firebase', [])
  // Saving these as values that can be injected into factories/controllers
  // for use throughout the application.
  .value('FIREBASE_REF', 'https://brilliant-heat-4193.firebaseio.com/')
  .value('userSession', {});

// Caches is a factory that gives functionality associated with getting
// a users caches (but contributable and received ones), and creating
// new ones.
firebaseServices.factory('Caches', function(FIREBASE_REF, userSession){
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

// FirebaseAuth contains functionality associated with logging the user into
// their Facebook account. Support for additional accounts (Google, Twitter, etc.) could be
// implemented here.
firebaseServices.factory('FirebaseAuth', function(FIREBASE_REF, userSession, Caches) {

  var usersRef = new Firebase(FIREBASE_REF).child('users');

  return {
    login: login
  };

  function login() {
    // Authenticate using Facebook
    usersRef.authWithOAuthPopup("facebook", function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Authenticated successfully with payload:", authData);

        // See if the returned uid is present in database
        usersRef.child(authData.uid).once('value', function(snapshot){
          var userObj = snapshot.val();
          var fbData = authData.facebook;

          // If the user is present in the database, return the user object. Otherwise
          // create a new user in the database with uid as unique key
          if (userObj) {
            userSession = userObj;
          } else {
            // Setting the template for a new user
            var newUserObj = {
              displayName: fbData.displayName,
              profilePicture: fbData.cachedUserProfile.picture.data.url,
            };
            // Setting the new user object in Firebase
            usersRef.child(authData.uid).set(newUserObj);
            console.log('new user added to the database');
            userSession = newUserObj;
          }
          console.log('the user session is', userSession);

          // Load the current user's received and contributable caches
          Caches.getReceived(authData.uid, function(caches){
            console.log('result of getReceived()', caches);
          });
          Caches.getContributable(authData.uid, function(caches){
            console.log('result of getContributable()', caches);
          });
        });
      }
    }, {
      // This causes Facebook to give us a token that will grant access
      // to the user's lists of friends in the future
      scope: "user_friends"
    });

  }
});
