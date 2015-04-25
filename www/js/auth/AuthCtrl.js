// Authentication controller
angular.module('snapcache.auth', [])

.controller('AuthCtrl', function($ionicLoading, $state, FirebaseAuth, userSession) {

  var self = this;

  // We'll want to know when the user wants to login
  // or is here to sign up.
  self.isLogin = true;

  // We'll also want to save their data somewhere.
  self.loginData = {
    username: '',
    password: ''
  };

  // Shows loading message.
  self.showLoading = function() {
    $ionicLoading.show({
      template: 'Logging in...'
    });
  };

  // Hides loading message.
  self.hideLoading = function(){
    $ionicLoading.hide();
  };

  // Use Authentication service to log in user.
  self.login = function() {
    console.log('Logging in');
    // Show loading message while logging in.
    self.showLoading();

    // Run Firebase Auth with redirect when in browser.
    if (!ionic.Platform.isAndroid() && !ionic.Platform.isIOS()) {
      FirebaseAuth.login().then(function(){

        // Hide loading message when Firebase returns.
        self.hideLoading();

        // Redirect to inbox after successful login.
        $state.go('app.inbox');
      });
    } else { // Run cordova facebook connect plugin on mobile
      FirebaseAuth.nativeLogin().then(function(){

        // Hide loading message when firebase returns
        self.hideLoading();

        // Redirect to inbox after successful login
        $state.go('app.inbox');
      });
    }
  };
});
