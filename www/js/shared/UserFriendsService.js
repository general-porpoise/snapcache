angular.module('snapcache.services.userFriends', [])

  // The code in this service was highly influenced by this
  // [example](http://codepen.io/calendee/pen/pCwyx).
.factory('UserFriends', function($q, $timeout, userSession){

  return {
    search: search
  };

  function search(searchFilter) {
    var friends = userSession.friends;

    // Find the matches based on the user's input from searchFilter.
    var matches = friends.filter(function(friend){
      if (friend.name.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1) {
        return true;
      }
    });
    return matches;
  }

});
