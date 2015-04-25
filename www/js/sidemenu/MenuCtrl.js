// Menu Controller
// The menu controller is the parent of Inbox, Outbox, and Create controllers.
angular.module('snapcache.menu', [])

.controller('MenuCtrl', function($scope, $ionicModal, $ionicPlatform, FIREBASE_REF, Caches, userSession, Geofire, Location) {

  // Initializing scope default values.
  var self = this;
  self.position;
  self.unreadIn = 0;
  self.unreadOut = 0;
  self.user = {
    name: userSession.name,
    profileUrl: userSession.profileUrl
  };

  var cachesRef = new Firebase(FIREBASE_REF).child('caches');

  // Read vs Unread logic for received caches. Responsible for menu badges.
  var receivedRef = new Firebase(FIREBASE_REF).child('users').child(userSession.uid).child('receivedCaches');
  // Create Firebase listener when a user gets a new inbound cache.
  receivedRef.on('child_added', function(addedSnapshot) {
    var id = addedSnapshot.key();
    cachesRef.child(id).once('value', function(cacheSnapshot) {
      var staleCache = cacheSnapshot.val();
      // If incoming caches have not already been read...
      if (!staleCache.hasOwnProperty('read_inbox')) {
        // Increment inbox count when new caches are discovered.
        if (!staleCache.discovered) {
          Caches.onCacheDiscovered(id).then(function(cache) {
            self.unreadIn++;
          });
        } else {
          // Increment inbox count.
          self.unreadIn++;
        }
        // Set read listener.
        cachesRef.child(id).on('child_added', function(childSnapshot) {
          // Decrement inbox count when inbox cache read.
          if (childSnapshot.key() === 'read_inbox') {
            self.unreadIn--;
          }
        });
      }
    });
  });

  // Read vs Unread logic for contributable caches.
  var contributableRef = new Firebase(FIREBASE_REF).child('users').child(userSession.uid).child('contributableCaches');
  contributableRef.on('child_added', function(addedSnapshot) {
    var id = addedSnapshot.key();
    var read = addedSnapshot.val();
    if (!read) {
      self.unreadOut++;
      contributableRef.child(id).on('value', function(contSnapshot) {
        // If value is true, outbound cache is read and we can decrement the unread count.
        if (contSnapshot.val()) {
          self.unreadOut--;
        }
      });
    }
  });

  // Closes create modal.
  self.closeCreate = function() {
    self.createModal.remove();
    // Broadcast an event to the child scope so that it knows to remove
    // the mapModal.
    $scope.$broadcast('closeCreate');
  };

  // Open the create modal.
  self.create = function() {
    $ionicModal.fromTemplateUrl('js/create/create.html', {
      scope: $scope
    }).then(function(modal) {
      self.createModal = modal;
      self.createModal.show();
    });
  };

  // Open the create modal when user clicks button on empty inbox/outbox.
  $scope.$on('openCreate', function() {
    self.create();
  });

  // Cleanup the modal if we close the app on it!
  $scope.$on('$destroy', function() {
    self.createModal.remove();
  });

  // ID for our user tracker.
  var watchID;

  var inForeground = true;

  // Signal when app brought to foreground
  $ionicPlatform.ready(function() {
    document.addEventListener('resume', function() {
      console.log('Geocoding will resume');
      inForeground = true;
    }, false);
  });

  // Signal when app sent to background
  $ionicPlatform.ready(function() {
    document.addEventListener('pause', function() {
      console.log('Geocoding paused while in background');
      inForeground = false;
    }, false);
  });

  // Watch user's position, store in userSession and update GeoFire.
  $scope.$on('$ionicView.beforeEnter', function() {
    if (watchID === undefined) {
      self.watchPosition();
    }
  });

  // Remove user from geofire when user closes app.
  $scope.$on('$destroy', function() {
    if (watchID !== undefined) {
      self.removeWatch();
    }
  });

  // Sets up a listener which responds to changes in the user's position.
  self.watchPosition = function() {
    watchID = navigator.geolocation.watchPosition(function(pos) {
      userSession.position = pos;

      // Remove key in order to satisfy the 'key entered' event
      // (when key already inside radius).
      Geofire.geofire.remove(userSession.uid);
      Geofire.geofire.set(userSession.uid, [
        pos.coords.latitude,
        pos.coords.longitude
      ]).then(function() {
        // console.log("Key set in GeoFire");
      }, function(error) {
        console.error("Error: " + error);
      });
    });
  };

  // Removes user position-change event listener.
  self.removeWatch = function() {
    // Stop watching user's position.
    navigator.geolocation.clearWatch(watchID);
    // Remove user from Geofire.
    Geofire.geofire.remove(userSession.uid);
  };

  // Set the user's initial position so that it is in line with what
  // is displayed when they open up the map view.
  navigator.geolocation.getCurrentPosition(function(pos){
    var lat = pos.coords.latitude;
    var lon = pos.coords.longitude;

    // Get the human-readable address from Google Maps Geocoding API.
    Location.getAddress(lat, lon).then(function(addrObj){
      var addr = addrObj.formatted_address;
      self.readable_location = addr;
      addrObj.address_components.forEach(function(comp) {
        // Get the user's city, if available.
        if (comp.types[0] === 'locality') {
          self.user.city = comp.long_name;
        }
        // Get the user's state, if available.
        if (comp.types[0] === 'administrative_area_level_1') {
          self.user.state = comp.short_name;
        }
      });
      userSession.readable_location = addr;
    });

    // Store the user's location.
    self.position = pos;
    userSession.position = pos;

    // Broadcast an event so that the child scope (Create) can update its
    // self.properties.coordinates in case the user has quickly navigated
    // to that view.
    $scope.$broadcast('locationAcquired', pos);
  });

  // Listen for `pinPlaced` events so that we know we can set the
  // new address in order to update the view.
  $scope.$on('pinPlaced', function(event, addr){
    self.readable_location = addr;
    userSession.readable_location = addr;
  });
});
