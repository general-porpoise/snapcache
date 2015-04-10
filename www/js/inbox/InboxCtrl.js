// Inbox module
angular.module('snapcache.inbox', [])

// Inbox controller
.controller('InboxCtrl', function (Caches, userSession) {
  var self = this;
  self.caches = {};

  // Retrieve list of incoming caches for logged-in user and store them for
  // use by ng-repeat in view.
  self.displayCaches = function () {
    Caches.getReceived().then(
      function (receivedCaches) {
        console.log('receivedCaches', receivedCaches);
        // For each cache in receivedCaches, get the details
        for (var key in receivedCaches) {
          // The following async function call has to be wrapped in an anonymous function to localize "key" to another name ("cacheID"). See [this page](http://stackoverflow.com/questions/13343340/calling-an-asynchronous-function-within-a-for-loop-in-javascript) for more information.
          (function (cacheID) {
            Caches.getCacheDetailsForDiscovered(cacheID).then(
              function (cache) {
                self.caches[cacheID] = cache;
              });
          })(key);
        }
      },
      function (error) {
        console.error('displayCaches error', error);
      });
  };

  self.setCurrentCache = function (cache) {
    userSession.currentCache = cache;
  };

  self.displayCaches();
});
