// Inbox module
angular.module('snapcache.inbox', [])

// Inbox controller
.controller('InboxCtrl', function (Caches) {
  var self = this;
  self.caches = {};

  // Retrieve list of incoming caches for logged-in user and store them for
  // use by ng-repeat in view.
  self.displayCaches = function () {
    Caches.getReceived().then(
      function (receivedCaches) {
        self.caches = receivedCaches;
      },
      function (error) {
        console.error('displayCaches erorr', error);
      });
  };

  self.displayCaches();
});
