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
    // check if the user has an account
    usersRef.authWithOAuthPopup("facebook", function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        console.log("Authenticated successfully with payload:", authData);
        console.log("and here is the uid", authData.uid);
      }
    }, {
      scope: "user_friends"
    });
    
  }
});