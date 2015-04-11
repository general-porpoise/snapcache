// Outbox module
angular.module('snapcache.outbox', [])

.controller('OutboxCtrl', function (Caches) {
  var self = this;
  self.caches = {};

  self.displayCaches = function () {
    Caches.getContributable().then(
      function (contributableCaches) {
        for (var key in contributableCaches) {
          // The following async function call has to be wrapped in an anonymous function to localize "key" to another name ("cacheID"). See [this page](http://stackoverflow.com/questions/13343340/calling-an-asynchronous-function-within-a-for-loop-in-javascript) for more information.
          (function (cacheID) {
            Caches.getCacheDetails(cacheID).then(
              function (cache) {
                self.caches[cacheID] = cache;
              });
          })(key);
        }
      },
      function (error) {
        console.error('Outbox displayCaches error', error);
      });
  };

  self.displayCaches();
});

