// Outbox module
angular.module('snapcache.outbox', [])

.controller('OutboxCtrl', function (Caches, FIREBASE_REF, userSession, $scope, $ionicModal) {
  var self = this;
  self.caches = [];

  self.displayCaches = function () {
    Caches.getContributable().then(
      function (contributableCaches) {
        self.caches = [];
        for (var key in contributableCaches) {
          // The following async function call has to be wrapped in an anonymous function to localize "key" to another name ("cacheID"). See [this page](http://stackoverflow.com/questions/13343340/calling-an-asynchronous-function-within-a-for-loop-in-javascript) for more information.
          (function (cacheID) {
            Caches.getCacheDetails(cacheID).then(
              function (cache) {
                cache._id = cacheID;
                self.caches.push(cache);

                // Set up timers to clear out caches on expiry, for those caches that have an expiry (have been discovered).
                if (cache.expiresAt) {
                  self.setTimerForExpiredRemoval(cache);
                }
              });
          })(key);
        }
      },
      function (error) {
        console.error('Outbox displayCaches error', error);
      });
  };

  // Displays detail view once the cache information has been stored.
  self.displayDetails = function (cache) {
    if (!cache.hasOwnProperty('read_outbox')) {
      // set caches to 'read' when first opened in detail view
      cache.read_outbox = true;
      new Firebase(FIREBASE_REF).child('caches').child(cache._id)
        .child('read_outbox').set(true);
    }
    userSession.currentCache = cache;
    self.showDetail();
  };

  // Shows the cache detail modal view
  self.showDetail = function() {
    // Creates the detail modal based on the specified template
    $ionicModal.fromTemplateUrl('js/detail/outboxDetail.html', {
      scope: $scope
    }).then(function(modal) {
      self.detailModal = modal;

      // Display the created modal
      self.detailModal.show();
    });
  };

  // Closes the cache detail modal view, and removes it to prevent memory leaks.
  self.closeDetail = function() {
    self.detailModal.remove();
  };

  // Schedules the given cache to be removed from the db at time of expiry
  self.setTimerForExpiredRemoval = function (cache) {
    // calculate offset from now
    var now = new Date().getTime();
    var timeUntilExpiry = cache.expiresAt - now;

    // // call removal fn at that offset time
    setTimeout(function () {
      self.displayCaches();
    }, timeUntilExpiry);
  };

  self.displayCaches();
});

