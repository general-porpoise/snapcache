// FirebaseAuth contains functionality associated with logging the user into
// their Facebook account. Support for additional accounts (Google, Twitter, etc.) could be
// implemented here.
//
angular.module('snapcache.services.auth', [])

.factory('FirebaseAuth', function($q, FIREBASE_REF, userSession, Caches) {

  var usersRef = new Firebase(FIREBASE_REF).child('users');

  return {
    login: login
  };

  function login() {
    var deferred = $q.defer();

    // Authenticate using Facebook
    usersRef.authWithOAuthRedirect("facebook", function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      }
    }, {
      // This causes Facebook to give us a token that will grant access
      // to the user's lists of friends in the future
      scope: "user_friends, email"
    });

    // Listen for changes in Auth state of app
    usersRef.onAuth(function(authData) {
      console.log("Authenticated successfully with payload:", authData);

      // See if the returned uid is present in database
      usersRef.child(authData.uid).once('value', function(snapshot){

        // No matter if the user is new or existing, we just need to update
        // their data property (if they are new, their entire tree will be created).
        userSession.uid = authData.uid;
        usersRef.child(authData.uid).child('data').set(authData);

        // Attempting to use promises
        if (authData.uid) {
          deferred.resolve(authData.uid);
        } else {
          deferred.reject('woops!');
        }
      });
    });

    return deferred.promise;
  }
});
