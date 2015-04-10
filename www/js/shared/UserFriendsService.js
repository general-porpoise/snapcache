angular.module('snapcache.services.userFriends', [])

  // The code in this service was highly influenced by this
  // [example](http://codepen.io/calendee/pen/pCwyx).
.factory('UserFriends', function($q, $timeout, FIREBASE_REF, userSession){
  // Obtain all of the users currently registered in
  // our application (from Firebase).
  var usersRef = new Firebase(FIREBASE_REF).child('users');

  return {
    search: search
  };

  function search(searchFilter) {
    // In the future, we will want to only look at the subset of a
    // user's Facebook friends that are registered in the app.
    var friends = userSession.friends;
    console.log('searching friends for', searchFilter);

    // Find the matches based on the user's inputed searchFilter.
    var matches = friends.filter(function(friend){
      if (friend.name.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1) {
        return true;
      }
    });
    return matches;
  }

});
