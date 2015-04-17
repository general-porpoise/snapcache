// Outbox Forward Module
angular.module('snapcache.outbox.forward', [])

.controller('OutboxForwardCtrl', function($scope, UserFriends){

  // Set default values
  $scope.person = {};
  $scope.person.name = '';
  $scope.contributors = {};

  // `search()` is used to display/filter potential people the user
  // can invite to contribute.
  $scope.search = function() {
    $scope.potentialContributors = UserFriends.search($scope.person.name);
  };

  // `toggleContributor()` will add/remove a friend from the list of contributors
  // based on if the friend is in the contributors obj or not.
  $scope.toggleContributor = function(friend) {
    var id = friend.id;
    if (id in $scope.contributors) {
      delete $scope.contributors[id];
    } else {
      $scope.contributors[id] = friend;
    }
    console.log('contributors are', $scope.contributors);
  };

  // Initialize search results to display all friends.
  $scope.search();
});
