// FirebaseAuth contains functionality associated with logging the user into
// their Facebook account.
angular.module('snapcache.services.auth', [])

.factory('FirebaseAuth', function($q, $http, FIREBASE_REF, userSession, Caches) {

  var firebaseRef = new Firebase(FIREBASE_REF);
  var usersRef = new Firebase(FIREBASE_REF).child('users');

  return {
    login: login,
    nativeLogin: nativeLogin
  };

  function login() {
    var deferred = $q.defer();

    // Authenticate using Facebook
    usersRef.authWithOAuthRedirect("facebook", function(error, authData) {
      if (error) {
        console.error("Login Failed!", error);
      }
    }, {
      // This causes Facebook to give us a token that will grant access
      // to the user's lists of friends in the future.
      scope: "user_friends, email"
    });

    // Listen for changes in Auth state of app.
    usersRef.onAuth(function(authData) {

      // We will update or add to Firebase based on the users uid returned
      // from the authData object.
      usersRef.child(authData.uid).once('value', function(snapshot){
        // Storing certain information on userSession for access anywhere in app.
        userSession.uid = authData.uid;
        userSession.name = authData.facebook.displayName;
        userSession.profileUrl = authData.facebook.cachedUserProfile.picture.data.url;

        // No matter if the user is new or existing, we just need to update
        // their data property (if they are new, their entire tree will be created).
        usersRef.child(authData.uid).child('data').set(authData);

        //Get the user's friends and save to userSession object.
        var fbId = authData.facebook.id;
        var fbToken = authData.facebook.accessToken;
        $http.get('https://graph.facebook.com/v2.3/' + fbId + '/friends?access_token=' + fbToken)
          // If we get a response back from Facebook, then we will resolve our promise with the
          // knowledge that the the user's friends are on the userSession object.
          .success(function(response){
            userSession.friends = response.data;
            // This allows the user to send caches to themselves.
            userSession.friends.push({
              id: fbId,
              name: authData.facebook.displayName
            });
            deferred.resolve();
          })
          // If we don't get a response, then we will reject our promise.
          .error(function(error){
            console.error('Get Facebook Friends Error:', error);
            deferred.reject();
          });
      });
    });
    return deferred.promise;
  }

  function nativeLogin() {
    var deferred = $q.defer();
    facebookConnectPlugin.login(['email', 'user_friends'], function(status) {
      facebookConnectPlugin.getAccessToken(function(token) {
        // Authenticate with Facebook using an existing OAuth 2.0 access token
        firebaseRef.authWithOAuthToken("facebook", token, function(error, authData) {
          if (error) {
            console.error('Firebase login failed!', error);
          } else {
            // We will update or add to Firebase based on the users uid returned
            // from the authData object.
            usersRef.child(authData.uid).once('value', function(snapshot){
              // Storing certain information on userSession for access anywhere in app.
              userSession.uid = authData.uid;
              userSession.name = authData.facebook.displayName;
              userSession.profileUrl = authData.facebook.cachedUserProfile.picture.data.url;

              // No matter if the user is new or existing, we just need to update
              // their data property (if they are new, their entire tree will be created).
              usersRef.child(authData.uid).child('data').set(authData);

              // Get the user's friends and save to userSession object.
              var fbId = authData.facebook.id;
              var fbToken = authData.facebook.accessToken;
              $http.get('https://graph.facebook.com/v2.3/' + fbId + '/friends?access_token=' + fbToken)
                // If we get a response back from Facebook, then we will resolve our promise with the
                // knowledge that the the user's friends are on the userSession object.
                .success(function(response){
                  userSession.friends = response.data;
                  // This allows the user to send caches to themselves.
                  userSession.friends.push({
                    id: fbId,
                    name: authData.facebook.displayName
                  });
                  deferred.resolve();
                })
                // If we don't get a response, then we will reject our promise.
                .error(function(error){
                  console.error('Facebook error on mobile!', error);
                  deferred.reject();
                });
            });
          }
        });
      }, function(error) {
        console.error('Could not get access token', error);
      });
    }, function(error) {
      console.error('An error occurred logging the user in', error);
    });
    return deferred.promise;
  }
});
