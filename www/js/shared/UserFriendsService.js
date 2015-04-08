angular.module('snapcache.services.userFriends', [])

.factory('UserFriends', function($q, FIREBASE_REF){
  // Obtain all of the users currently registered in
  // our application (from Firebase).
  var usersRef = new Firebase(FIREBASE_REF).child('users');

  return {
    searchFriends: searchFriends,
    getAllUsers: getAllUsers
  };

  function getAllUsers() {
    var deferred = $q.defer();
    usersRef.once('value', function(snapshot){
      var users = snapshot.val();
      if (users) {
        deferred.resolve(users);
      } else {
        deferred.reject({});
      }
    });
    return deferred.promise;
  }

  function searchFriends(searchFilter) {
    getAllUsers().then(function(users){
      console.log('user objects', users);
      var friendNames = _getDisplayNames(users);
      console.log(friendNames);
    });
  }

  // `_getDisplayNames()` takes in an object whose keys each correspond
  // to user objects (where each key is the Facebook Authentication ID).
  // The result is an array of display names for use in displaying to
  // the user when they are searching for recipients.
  function _getDisplayNames(users) {
    var displayNames = [];
    for (var user in users) {
      var name = users[user].data.facebook.displayName;
      displayNames.push(name);
    }
    return displayNames;
  }
});
