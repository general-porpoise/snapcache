// Snapcache
// Authors: Anneke Floor, Chris Rinaldi, Conor Flannigan
angular.module('snapcache', [
  'ionic',
  'firebase',
  'snapcache.auth',
  'snapcache.menu',
  'snapcache.inbox',
  'snapcache.outbox',
  'snapcache.create',
  'snapcache.detail.inbox',
  'snapcache.detail.outbox',
  'snapcache.outbox.invite',
  'snapcache.services.caches',
  'snapcache.services.auth',
  'snapcache.services.geofire',
  'snapcache.services.userFriends',
  'snapcache.services.location',
  'snapcache.services.camera',
  'snapcache.services.cloudinary',
  'snapcache.services.giphy',
  'snapcache.config',
  'angularMoment'
])

.value('FIREBASE_REF', 'https://brilliant-heat-4193.firebaseio.com/')
.value('userSession', {uid: ''})

.run(function($ionicPlatform, userSession) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs).
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "js/sidemenu/menu.html",
    controller: 'MenuCtrl as menuCtrl'
  })

  .state('app.inbox', {
    url: "/inbox",
    views: {
      'menuContent': {
        templateUrl: "js/inbox/inbox.html",
        controller: "InboxCtrl as inctrl"
      }
    }
  })

  .state('app.outbox', {
    url: "/outbox",
    views: {
      'menuContent': {
        templateUrl: "js/outbox/outbox.html",
        controller: "OutboxCtrl as outctrl"
      }
    }
  })

  .state('auth', {
    url: "/auth",
    templateUrl: "js/auth/auth.html",
    controller: 'AuthCtrl as actrl'
  });
  // If none of the above states are matched, use this as the fallback.
  $urlRouterProvider.otherwise('/auth');
});
