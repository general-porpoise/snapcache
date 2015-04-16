// Inbox module
angular.module('snapcache.inbox', [])

// Inbox controller
.controller('InboxCtrl', function (FIREBASE_REF, Caches, userSession, $scope, $ionicModal, Geofire) {
  var self = this;
  self.caches = [];
  self.colors = ["purple-snap", "green-snap", "yellow-snap", "blue-snap"];

  self.getColorClass = function() {
    var color = self.colors.shift();
    self.colors.push(color);
    return color;
  };

  // Retrieves list of incoming caches for logged-in user and stores them for
  // use by ng-repeat in view.
  self.displayCaches = function () {
    console.log('displaying caches...');
    Caches.getReceived().then(
      function (receivedCaches) {
        self.caches = [];
        console.log('receivedCaches', receivedCaches);
        // Set listeners on received caches
        Geofire.setListeners(receivedCaches);
        // For each cache in receivedCaches, get the details
        for (var key in receivedCaches) {
          // The following async function call has to be wrapped in an anonymous function to localize "key" to another name ("cacheID"). See [this page](http://stackoverflow.com/questions/13343340/calling-an-asynchronous-function-within-a-for-loop-in-javascript) for more information.
          (function (cacheID) {
            Caches.getCacheDetailsForDiscovered(cacheID).then(
              function (cache) {
                cache._id = cacheID;
                self.caches.push(cache);

                // Set up timers to clear out caches on expiry
                self.setTimerForExpiredRemoval(cache);
              });

            // Set up firebase listeners to populate inbox list with newly
            // discovered caches
            Caches.onCacheDiscovered(cacheID).then(function(cache) {
              console.log('pushing discovered cache to inbox');
              cache._id = cacheID;
              self.caches.push(cache);
              // set expiry timer for newly discovered cache
              self.setTimerForExpiredRemoval(cache);
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
      cache._id = childSnapshot.key();
      self.caches.push(cache);
    });
  });

  // Displays detail view once the cache information has been stored.
  self.displayDetails = function (cache) {
    if (!cache.hasOwnProperty('read_inbox')) {
      // set caches to 'read' when first opened in detail view
      cache.read_inbox = true;
      new Firebase(FIREBASE_REF).child('caches').child(cache._id)
        .child('read_inbox').set(true);
    }
    userSession.currentCache = cache;
    self.showDetail();
  };

  // Shows the cache detail modal view
  self.showDetail = function() {
    // Creates the detail modal based on the specified template
    $ionicModal.fromTemplateUrl('js/detail/inboxDetail.html', {
      scope: $scope
    }).then(function(modal) {
      self.detailModal = modal;

      // Display the created modal
      self.detailModal.show();
    });
  };

  //Cleanup the modal if we close the app on it!
  $scope.$on('$destroy', function() {
    self.detailModal.remove();
  });

  // Closes the cache detail modal view, and removes it to prevent memory leaks.
  self.closeDetail = function() {
    self.detailModal.remove();
  };

  // Schedules the given cache to be removed from the db at time of expiry
  self.setTimerForExpiredRemoval = function (cache) {
    // calculate offset from now
    var now = new Date().getTime();
    var timeUntilExpiry = cache.expiresAt - now;
    console.log('timeUntilExpiry', timeUntilExpiry);

    // // call removal fn at that offset time
    setTimeout(function () {
      console.log('REDISPLAY Caches');
      self.displayCaches();
    }, timeUntilExpiry);
  };

  self.displayCaches();
});
