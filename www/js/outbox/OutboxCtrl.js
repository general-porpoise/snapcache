// Outbox module
angular.module('snapcache.outbox', [])

.controller('OutboxCtrl', function (Caches, userSession, $scope, $ionicModal) {
  var self = this;
  self.caches = [];

  self.displayCaches = function () {
    Caches.getContributable().then(
      function (contributableCaches) {
        for (var key in contributableCaches) {
          // The following async function call has to be wrapped in an anonymous function to localize "key" to another name ("cacheID"). See [this page](http://stackoverflow.com/questions/13343340/calling-an-asynchronous-function-within-a-for-loop-in-javascript) for more information.
          (function (cacheID) {
            Caches.getCacheDetails(cacheID).then(
              function (cache) {
                self.caches.push(cache);
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
    userSession.currentCache = cache;
    userSession.currentCache.controller = 'outctrl';
    self.showDetail();
  };

  // Shows the cache detail modal view
  self.showDetail = function() {
    // Creates the detail modal based on the specified template
    $ionicModal.fromTemplateUrl('js/detail/detail.html', {
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


  self.displayCaches();
});

