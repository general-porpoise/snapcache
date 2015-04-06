// Authentication controller
angular.module('snapcache.auth', [])

.controller('AuthCtrl', function($scope) {

  $scope.isLogin = true;

  $scope.loginData = {
    username: '',
    password: ''
  };

  $scope.submit = function() {
    if ($scope.isLogin) {
      $scope.login();
    } else {
      $scope.signup();
    }
  }

  $scope.login = function() {
    console.log('Logging in');
  };

  $scope.signup = function() {
    console.log('Signing up');
  };

});
