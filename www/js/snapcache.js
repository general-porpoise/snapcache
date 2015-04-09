// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('snapcache', [
  'ionic',
  'snapcache.auth',
  'snapcache.menu',
  'snapcache.inbox',
  'snapcache.create',
  'snapcache.map',
  'snapcache.services.caches',
  'snapcache.services.auth'
  ])

.value('FIREBASE_REF', 'https://brilliant-heat-4193.firebaseio.com/')
.value('userSession', {uid: ''})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
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
        templateUrl: "js/outbox/outbox.html"
      }
    }
  })

  .state('auth', {
    url: "/auth",
    templateUrl: "js/auth/auth.html",
    controller: 'AuthCtrl as actrl'
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/auth');
});
