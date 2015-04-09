// Authentication controller
angular.module('snapcache.auth', [])

.controller('AuthCtrl', function($location, FirebaseAuth, userSession) {

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
  };

  // Use Authentication service to login user
  self.login = function() {
    console.log('Logging in');

    FirebaseAuth.login().then(function(uid){
      // Setting the user's id so that it can be accessed anywhere that
      // the value "userSession" is injected.
      userSession.uid = uid;
      console.log('the users id is:', uid);

      // Redirect to inbox after successful login
      $location.path('/app/inbox');
    });
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
