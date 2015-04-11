// Inbox module
angular.module('snapcache.inbox', [])

// Inbox controller
.controller('InboxCtrl', function (Caches, userSession, $scope, $ionicModal, Geofire) {
  var self = this;
  self.caches = {};

  // Retrieves list of incoming caches for logged-in user and stores them for
  // use by ng-repeat in view.
  self.displayCaches = function () {
    Caches.getReceived().then(
      function (receivedCaches) {
        console.log('receivedCaches', receivedCaches);
        // Set listeners on received caches
        Geofire.setListeners(receivedCaches);
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

  // Displays detail view once the cache information has been stored.
  self.displayDetails = function (cache) {
    userSession.currentCache = cache;
    self.showDetail();
  };

  // Shows the cache detail modal view
  self.showDetail = function() {
    // Creates the detail modal based on the specified template
    $ionicModal.fromTemplateUrl('js/detail/detail.html', {
      scope: $scope
    }).then(function(modal) {
      console.log('modal created here');
      self.detailModal = modal;

      // Display the created modal
      self.detailModal.show();
    });
  };

  // Closes the cache detail modal view, and removes it to prevent memory leaks.
  self.closeDetail = function() {
    self.detailModal.hide();
    self.detailModal.remove();
  };

  self.displayCaches();
});
