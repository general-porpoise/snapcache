// Outbox Invite Module
angular.module('snapcache.outbox.invite', [])

.controller('OutboxInviteCtrl', function($scope, Caches, userSession){

  // Set default values.
  $scope.person = {};
  $scope.person.name = '';
  $scope.contributors = {};
  $scope.friends = userSession.friends;

  // `toggleContributor()` will add/remove a friend from the list of contributors
  // based on if the friend is in the contributors obj or not.
  $scope.toggleContributor = function(friend) {
    var id = friend.id;
    if (id in $scope.contributors) {
      delete $scope.contributors[id];
    } else {
      $scope.contributors[id] = friend;
    }
  };

  // `isChecked()` is a helper function to ensure that the checkbox remains
  // whatever value it was, even after the user performs a search.
  $scope.isChecked = function(friend) {
    if (friend.id in $scope.contributors) {
      return true;
    } else {
      return false;
    }
  };

  $scope.submit = function() {
    // Iterate through the contributors, updating Firebase.
    for (var id in $scope.contributors) {
      var cacheID = userSession.currentCache._id;
      var fbID = 'facebook:' + id;
      Caches.addContributor(cacheID, fbID);
    }
  };
});
