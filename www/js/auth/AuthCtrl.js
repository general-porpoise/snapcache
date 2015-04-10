// Authentication controller
angular.module('snapcache.auth', [])

.controller('AuthCtrl', function($location, $ionicLoading, FirebaseAuth, userSession) {

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

  // Shows loading message
  self.showLoading = function() {
    $ionicLoading.show({
      template: 'Logging in...'
    });
  };

  // Hides loading message
  self.hideLoading = function(){
    $ionicLoading.hide();
  };

  // Use Authentication service to login user
  self.login = function() {
    console.log('Logging in');
    // show loading message while logging in
    self.showLoading();

    FirebaseAuth.login().then(function(uid){
      // Setting the user's id so that it can be accessed anywhere that
      // the value "userSession" is injected.
      userSession.uid = uid;

      // TODO: Currently hard-coding the user's friends. We will probably want to get this
      // list in FirebaseAuthService when the user logs in
      userSession.friends = [
        {name: 'Conor Flannigan', uid: 'facebook:10204075896841208'},
        {name: 'Anneke Floor', uid: 'facebook:10206286278296373'}
      ];

      console.log('the users id is:', uid);

      // Hide loading message when firebase returns
      self.hideLoading();

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
