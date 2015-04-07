// Authentication controller
angular.module('snapcache.auth', [])

.controller('AuthCtrl', function($location) {

  var self = this;

  // We'll want to know when the user wants to login
  // or is here to sign up.
  self.isLogin = true;

  // We'll also want to save their data somewhere...
  self.loginData = {
    username: '',
    password: ''
  };

  // `submit` decides whether to call `login` or `submit`
  // depending on the status of the user.
  self.submit = function() {
    if (self.isLogin) {
      self.login();
    } else {
      self.signup();
    }
  }

  // Use Authentication service to login user
  self.login = function() {
    console.log('Logging in');

    // TODO: login user

    // redirect to inbox after successful login
    $location.path('/app/inbox');
  };

  // Use Authentication service to sign user up
  self.signup = function() {
    console.log('Signing up');
    
    // TODO: signup user

    // login user afte successful signup
    self.login();
  };

  // Toggles status of user (new vs. returning)
  self.toggleLogin = function() {
    self.isLogin = !self.isLogin;
  };

});
