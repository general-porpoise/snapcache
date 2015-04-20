// Outbox module
angular.module('snapcache.outbox', [])

.controller('OutboxCtrl', function (Caches, FIREBASE_REF, userSession, $scope, $ionicModal, $timeout) {
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

        // If an owner's cache is not expired, display it and set a removal timer. Otherwise, remove
        // it from Firebase.
        //
        // NOTE: This only happens when the outbox controller is opened
        // for the first time.
        if (cache.droptime + cache.window + cache.lifespan > Date.now()) {
          self.caches.push(cache);

          // Set a timer to remove from user's outbox while they still have
          // it open.
          self.setTimerForExpiredRemoval(cache);
        } else {
          Caches.removeCache(cacheID, cache);
        }
      });
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
    var timeUntilExpiry;
    var now = new Date().getTime();
    // If the cache as an `expiresAt` property, use that to schedule for
    // removal. Otherwise, use the maximum time that the cache could be around.
    if (cache.expiresAt) {
      timeUntilExpiry = cache.expiresAt - now;
    } else {
      var expiresAt = cache.droptime + cache.window + cache.lifespan
      timeUntilExpiry = expiresAt - now;
    }

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
    console.log('caches are', self.caches);
    // Remove the cache from Firebase
    Caches.removeCache(cacheToRemove._id, cacheToRemove);

    // Remove the cache from scope
    self.caches = self.caches.filter(function(cache){
      return cache._id !== cacheToRemove._id;
    });
  };

  self.displayCaches();
});

