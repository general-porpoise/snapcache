// Authentication controller
angular.module('snapcache.auth', [])

.controller('AuthCtrl', function($scope) {

  // We'll want to know when the user wants to login
  // or is here to sign up.
  $scope.isLogin = true;

  // We'll also want to save their data somewhere...
  $scope.loginData = {
    username: '',
    password: ''
  };

  // `submit` decides whether to call `login` or `submit`
  // depending on the status of the user.
  $scope.submit = function() {
    if ($scope.isLogin) {
      $scope.login();
    } else {
      $scope.signup();
    }
  }

  // Use Authentication service to login user
  $scope.login = function() {
    console.log('Logging in');
  };

  // Use Authentication service to sign user up
  $scope.signup = function() {
    console.log('Signing up');
  };

  // Toggles status of user (new vs. returning)
  $scope.toggleLogin = function() {
    $scope.isLogin = !$scope.isLogin;
  };

});
