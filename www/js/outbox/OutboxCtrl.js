// Outbox module
angular.module('snapcache.outbox', [])

.controller('OutboxCtrl', function (Caches, FIREBASE_REF, userSession, $scope, $ionicModal, $timeout, $interval) {
  var self = this;
  self.caches = [];

  self.displayCaches = function() {
    var userRef = new Firebase(FIREBASE_REF).child('users').child(userSession.uid);

    // Set Firebase listeners so that the outbox will be dynamically updated
    // whenever the user receives a new cache to contribute to.
    //
    // NOTE: 'child_added' is triggered once for each existing child, and then
    // for any new children that are added.
    userRef.child('contributableCaches').on('child_added', function(snapshot){
      var cacheID = snapshot.key();
      Caches.getCacheDetails(cacheID).then(function(cache) {
        cache._id = cacheID;

        // If an owner's cache is not expired, display it and set a removal timer.
        // Otherwise, remove it from Firebase.
        //
        // NOTE: This only happens when the outbox controller is opened
        // for the first time.
        if (cache.droptime + cache.window + cache.lifespan > Date.now()) {
          // set cache as read or unread
          if (snapshot.val() === true) { // cache is read
            cache.read_outbox = true;
          }

          // set interval to indicate when cache becomes available (but not discovered)
          $interval(function() {
            cache.isAvailable = Date.now() >= cache.droptime;
          }, 1000);

          self.caches.push(cache);

          // Setup a different timer if the cache is discovered while the user
          // is logged in.
          Caches.onCacheDiscovered(cacheID).then(function(freshCache){
            $timeout(function() {
              cache.discovered = true;
            }, 100);
            self.setTimerForExpiredRemoval(freshCache);
          });
        } else {
          Caches.removeCache(cacheID, cache);
        }
      });
    });
  };

  // Displays detail view once the cache information has been stored.
  self.displayDetails = function (cache) {
    var contributableRef = new Firebase(FIREBASE_REF).child('users').child(userSession.uid).child('contributableCaches');
    if (!cache.hasOwnProperty('read_outbox')) {// if the cache is unread
      // flag it as "read" on firebase and locally
      contributableRef.child(cache._id).set(true);
      cache.read_outbox = true;
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

  //Cleanup the modal if we close the app on it!
  $scope.$on('$destroy', function() {
    self.detailModal.remove();
  });

  // Closes the cache detail modal view, and removes it to prevent memory leaks.
  self.closeDetail = function() {
    self.detailModal.remove();
  };

  // Schedules the given cache to be removed from the db at time of expiry
  self.setTimerForExpiredRemoval = function (cache, removeFromFirebase) {
    // calculate offset from now
    var timeUntilExpiry;
    var now = new Date().getTime();
    timeUntilExpiry = cache.expiresAt - now;

    // Call removal function at the offset time
    $timeout(function () {
      self.removeCache(cache);
    }, timeUntilExpiry);
  };

  self.create = function() {
    // Tell menuctrl to open the create modal
    // Must do this in order for create modal to behave correctly
    $scope.$emit('openCreate');
  };

  self.removeCache = function(cacheToRemove) {
    // Remove the cache from scope
    var idx;
    self.caches.forEach(function(cache, i){
      if (cache._id === cacheToRemove._id) {
        idx = i;
      }
    });
    self.caches.splice(idx, 1);
  };

  self.displayCaches();
});

