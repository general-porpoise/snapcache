// FirebaseAuth contains functionality associated with logging the user into
// their Facebook account. Support for additional accounts (Google, Twitter, etc.) could be
// implemented here.
//
angular.module('snapcache.services.auth', [])

.factory('FirebaseAuth', function(FIREBASE_REF, userSession, Caches) {

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
            userSession = userObj; // TODO: just store the uid
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
