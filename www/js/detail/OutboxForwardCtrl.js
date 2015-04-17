// Outbox Forward Module
angular.module('snapcache.outbox.forward', [])

.controller('OutboxForwardCtrl', function($scope, UserFriends){

  $scope.person = {};
  $scope.person.name = '';

  $scope.search = function() {
    $scope.potentialContributors = UserFriends.search($scope.person.name);
  };

  $scope.search();
});
