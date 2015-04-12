// Inbox module
angular.module('snapcache.inbox', [])

// Inbox controller
.controller('InboxCtrl', function (FIREBASE_REF, Caches, userSession, $scope, $ionicModal, Geofire) {
  var self = this;
  self.caches = [];

  // Retrieves list of incoming caches for logged-in user and stores them for
  // use by ng-repeat in view.
  self.displayCaches = function () {
    console.log('displaying caches...');
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
                self.caches.push(cache);
              });

            // Set up firebase listeners to populate inbox list with newly
            // discovered caches
            Caches.onCacheDiscovered(cacheID).then(function(cache) {
              console.log('pushing discovered cache to inbox');
              self.caches.push(cache);
            });
          })(key);
        }
      },
      function (error) {
        console.error('displayCaches error', error);
      });
  };

  // listen for new received caches
  var receivedRef = new Firebase(FIREBASE_REF).child('users').child(userSession.uid).child('receivedCaches');
  receivedRef.on('child_added', function(childSnapshot) {
    console.log('Setting new geofire listener');
    console.log('key is', childSnapshot.key());
    Geofire.setListener(childSnapshot.key());
    Caches.onCacheDiscovered(childSnapshot.key()).then(function(cache) {
      console.log('pushing discovered cache to inbox');
      self.caches.push(cache);
    });
  });

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
