var firebaseServices = angular.module('snapcache.services.firebase', []);

firebaseServices.factory('Caches', function($http){

  return {
    getAll: getAll,
    create: create
  }

  function getAll() {
    console.log('Get all caches!');
  }

  function create() {
    console.log('Create a cache!');
  }

});

firebaseServices.factory('FirebaseAuth', function() {

  var usersRef = new Firebase("https://brilliant-heat-4193.firebaseio.com/users");

  return {
    login: login
  }

  function login() {
    // Authenticate using Facebook 
    usersRef.authWithOAuthPopup("facebook", function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Authenticated successfully with payload:", authData);

        // See if the returned uid is present in database
        var queryResult = usersRef.child(authData.uid).once('value', function(snapshot){
          var userObj = snapshot.val();

          // If the user is present in the database, return the user object. Otherwise
          // create a new user in the database with uid as unique key
          if (userObj) {
            console.log('the user object is', userObj);
            // TODO: Need to save the user object so it is accessible in our app
          } else {

            // Template for a new user
            var newUserObj = {
              message: "Yay!!!"
            };
            
            usersRef.child(authData.uid).set(newUserObj);
            console.log('new user added to the database');
            // TODO: Need to save the user object so that it is accessible in our app
          }
        });
      }
    }, {
      // This causes Facebook to give us a token that will grant access
      // to the user's lists of friends in the future
      scope: "user_friends"
    });
    
  }
});