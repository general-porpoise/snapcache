// Create Controller
angular.module('snapcache.create', [])

// Converts a value from the radius slider to a readable format
.filter('radiusRange', function() {
  var pluralize = function(value, unit) {
    if (value === 1) {
      return '' + value + ' ' + unit;
    } else {
      return '' + value + ' ' + unit + 's';
    }
  };
  // The user can select from 25 - 5280 in feet, or 1 to 5 miles.
  return function(value) {
    var val;
    if (value < 5280) {
      val = 25 * Math.floor(value / 25);
      return '' + val + ' ' + 'feet';
    } else {
      val = Math.floor(value / 2640) - 1;
      return pluralize(val, 'mile');
    }
  };
})

// Converts a value from the time sliders to a readable format
.filter('defaultRange', function() {
  var pluralize = function(value, unit) {
    if (value === 1) {
      return '' + value + ' ' + unit;
    } else {
      return '' + value + ' ' + unit + 's';
    }
  };

  return function(value) {
    // 40710 is the least common multiple between
    // 59 (minutes), 23 (hours), and 30 (days)
    var val;
    if (value < 40710) { // 230
      val = Math.floor((value / 690) + 1);
      return pluralize(val, 'minute');
    } else if (value < 81420) {
      val = Math.floor(((value - 40710) / 1770) + 1);
      return pluralize(val, 'hour');
    } else {
      val = Math.ceil((value - 81420) / 1357);
      return pluralize(val, 'day');
    }
  };
})

// Converts a result of the radiusRange filter to kilometers
.filter('toKilometers', function() {
  return function(radiusValue) {
    var value = parseInt(radiusValue);
    if (radiusValue.indexOf('feet') > -1) {
      return (value / 5280) * 1.60934;
    } else {
      return value * 1.60934;
    }
  };
})

// Converts a result of the defaultRange filter to milliseconds
.filter('toMilliseconds', function() {
  return function(rangeValue) {
    var value = parseInt(rangeValue);
    if (rangeValue.indexOf('min') > -1) {
      return 60000 * value;
    } else if (rangeValue.indexOf('hour') > -1) {
      return 3600000 * value;
    } else {
      return 86400000 * value;
    }
  };
})

.controller('CreateCtrl', function($filter, $scope, $ionicModal, $timeout, Caches, UserFriends, userSession, $ionicPopover, Location, Camera, Cloudinary, $ionicLoading) {

  var self = this;
  self.properties = {};
  self.datetime = {};

  // Set default value for initial dropdate.
  // NOTE: We need this to be at 12am on today because the user still has to
  //       enter a time, which will be offset from the default date.
  // Below is a hackish way to get a date object that represents today at 12am.
  var currTime = new Date(Date.now());
  self.datetime.dropdate = new Date(
    (currTime.getMonth() + 1) + "/" +
    currTime.getDate() + "/" +
    currTime.getFullYear());

  // Set sane defaults for slider values (1 hour)
  self.window_slider = 40710;
  self.lifespan_slider = 40710;

  // Default value for cache radius will be 225 ft
  self.radius_slider = 225;

  // Cache will have the `discovered` property set to false
  self.properties.discovered = false;

  // Want to use the user's current location as the default location
  self.properties.coordinates = {
    latitude: userSession.position.coords.latitude,
    longitude: userSession.position.coords.longitude
  };

  // `convertDateTime()` will take the user provided input and convert it to
  // milliseconds. To do this, it also has to know what date the user selected.
  // Only once the user has selected a date does the time box open up.
  self.convertDateTime = function() {
    var dateMS = self.datetime.dropdate.getTime();
    var timeMS = self.datetime.droptime.getTime();
    // Offset is due to the fact that we are calculating it for PST.
    var offset = 8 * 60 * 60 * 1000;
    self.properties.droptime = dateMS + timeMS - offset;
    console.log('time in ms from 1970 is', self.properties.droptime);
  };

  // `search()` allows the the user to search through the list of their friends.
  // Due to the way that the Facebook Friends API works, this list will only
  // include friends that have also authorized the Snapcache app.
  // Allow the user to search through the list of their friends
  self.search = function() {
    self.potentialRecipients = UserFriends.search(self.recipient);
    console.log('result of friend search', self.potentialRecipients);
  };

  // `addRecipient()` will take the friend that the user clicked
  // on and populate the recipient field, along with filling the recipient
  // property on the the object sent to Firebase.
  self.addRecipient = function(friend) {
    self.recipient = friend.name;
    // Collapse the list of potential recipients once the user clicks
    // on the friend they are sending the cache to.
    self.potentialRecipients = [];

    // Attach the friend's id to the object that will be sent over to Firebase
    self.properties.recipients = {};
    self.properties.recipients['facebook:' + friend.id] = true;
  };

  self.submitNewCache = function() {
    console.log('New cache submitted');

    // Adding the user's id so that we can know what user(s) to associate
    // this created cache with in Firebase.)
    self.properties.contributors = {};
    self.properties.contributors[userSession.uid] = true;
    // Set cache location as property to be stored
    // self.properties.coordinates = {
    //   latitude: userSession.position.coords.latitude,
    //   longitude: userSession.position.coords.longitude
    // };
    // Store human-readable location in database
    self.properties.readable_location = userSession.readable_location;
    // get milliseconds for time range sliders
    self.properties.window = $filter('toMilliseconds')($filter('defaultRange')(self.window_slider));
    self.properties.lifespan = $filter('toMilliseconds')($filter('defaultRange')(self.lifespan_slider));
    // Get kilometers for cache range
    self.properties.radius = $filter('toKilometers')($filter('radiusRange')(self.radius_slider));

    Caches.create(self.properties);
  };

  // Create the map modal that we will use later
  $ionicModal.fromTemplateUrl('js/create/map.html', {
    scope: $scope
  }).then(function(modal) {
    self.mapModal = modal;
  });

  // Create an event listener that will remove the map modal whenever
  // the user creates or closes the Create Cache view.
  //
  // NOTE: It must be done this way since the closing of the Create Cache view
  // occurs in a parent scope, which has no knowledge of the mapModal.
  $scope.$on('closeCreate', function(){
    self.mapModal.remove();
  });

  //Cleanup the modal if we close the app on it!
  $scope.$on('$destroy', function() {
    self.mapModal.remove();
  });

  // Triggered in the map modal to close it
  self.closeMap = function() {
    self.render = false;
    self.mapModal.hide();
  };

  // Open the map modal
  self.showMap = function() {
    console.log('opening map');
    self.mapModal.show();
    if (!self.map) {
      self.initializeMap();
    }
  };

  // Main function that sets up the map and adds in event handling
  self.initializeMap = function() {
    // Get the user's location (or default to San Francisco).
    var myLatlng = new google.maps.LatLng(37.3000, -120.4833);
    if (userSession.position) {
      var coords = userSession.position.coords;
      myLatlng = new google.maps.LatLng(coords.latitude, coords.longitude);
    }
    // Set default values for the map.
    var mapOptions = {
      center: myLatlng,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    // Create the map object and center it.
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    map.setCenter(myLatlng);
    self.map = map;

    // Add event listener for mousedown event
    google.maps.event.addListener(self.map, 'mousedown', function(event){
      console.log('detected a mouse down event!');

      // If the user has not already initiated a mousedown event, create
      // a function that will run in 1 second, placing the marker at the
      // desired location. This is done so that the user will have to do a
      // long click in order to place a marker somewhere.
      if (angular.isUndefined(self.placeMarkerPromise)) {
        self.placeMarkerPromise = $timeout(function() {
          console.log('marker placed at', event.latLng);
          self.placeMarker(event.latLng);
        }, 1000);
      }
    });

    // Add event listener for mouseup event
    google.maps.event.addListener(self.map, 'mouseup', function(){
      console.log('detected a mouse up event');
      self.placeMarkerCancel();
    });

    // Add event listener for dragstart event
    google.maps.event.addListener(self.map, 'dragstart', function(){
      console.log('detected a drag event');
      self.placeMarkerCancel();
    });

    // Finally, place the marker at the user's location. Have to use
    // $timeout due to Angular constraint that only one $apply can run
    // at a time.
    $timeout(function() {
      self.placeMarker(myLatlng);
    }, 100);

  };

  // `placeMarker()` will remove the current marker and create a new one
  // at the user provided latLng.
  self.placeMarker = function(latLng) {
    self.removeMarker();
    self.marker = new google.maps.Marker({
      animation: google.maps.Animation.DROP,
      draggable: true,
      map: self.map,
      position: latLng
    });

    self.circle = new google.maps.Circle({
      strokeColor: '#CCCCCC',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FFFFFF',
      fillOpacity: 0.45,
      map: self.map,
      center: latLng,
      radius: self.getRadiusMeters(),
      geodesic: true
    });

    self.circle.bindTo('center', self.marker, 'position');

    google.maps.event.addListener(self.marker, 'drag', function(event) {
      self.circle.setCenter(event.latLng);
    });

    delete self.placeMarkerPromise;

    // Updating any data that the scope needs to know about due to the
    // fact we are doing this from within an asynchronous call.
    $scope.$apply(function() {
      self.properties.coordinates = {
        latitude: latLng.k,
        longitude: latLng.D
      };
      console.log('the markers pos is:', self.properties.coordinates);
    });

    // Emitting an event so that the parent controller (menuCtrl) can
    // change the `readable_location` and position `parameters`.
    Location.getAddress(latLng.k, latLng.D).then(function(addr){
      $scope.$emit('pinPlaced', addr);
    });
  };

  // `placeMarkerCancel()` will remove the function that is scheduled to
  // run (due to a user initiated event, such as lifting their mouse,
  // or dragging).
  self.placeMarkerCancel = function() {
    if (angular.isUndefined(self.placeMarkerPromise)) {
      return;
    }
    // Cancel the scheduled code
    $timeout.cancel(self.placeMarkerPromise);
    delete self.placeMarkerPromise;
  };

  // `removeMarker()` will remove the marker so that it is no longer
  // on the map.
  self.removeMarker = function() {
    if (angular.isDefined(self.marker)) {
      self.marker.setMap(null);
      delete self.marker;
      self.removeCircle();
    }
  };

  self.removeCircle = function() {
    self.circle.setMap(null);
    delete self.circle;
  };

  // Gets current radius in meters
  self.getRadiusMeters = function() {
    var radiusString = $filter('radiusRange')(self.radius_slider);
    var value = parseInt(radiusString);
    var meters = 0;
    if (radiusString.indexOf('feet') > -1) {
      // convert feet to meters
      meters = value * 0.3048;
    } else { // miles
      // convert miles to meters
      meters = value * 1609.34;
    }
    return meters;
  };

  // Updates map circle radius with current setting
  self.slideRadius = function() {
    self.circle.setRadius(self.getRadiusMeters());
  };

  self.popover;

  // Create popover to display friends
  $ionicPopover.fromTemplateUrl('js/create/friends.html', {
    scope: $scope,
    focusFirstInput: true
  }).then(function(popover) {
    self.popover = popover;
  });


  self.openPopover = function($event) {
    console.log('showing popover');
    self.potentialRecipients = UserFriends.search('');
    self.popover.show($event);
  };

  self.closePopover = function() {
    self.popover.hide();
  };

  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    self.popover.remove();
  });

  // 'getPhoto()' opens the camera for picture taking and ...
  self.getPhoto = function () {
    console.log('GET PHOTO');
    Camera.getPicture({
      destinationType: navigator.camera.DestinationType.DATA_URL,
      targetHeight: 1500,
      targetWidth: 1500,
      quality: 25 // set below 50 to avoid iOS memory errors
    })
    .then(
      function (imageURI) {
        console.log('PHOTO GOTTEN');
        self.showLoading('Uploading...');
        Cloudinary.uploadImage(imageURI).then(
          function () {
            console.log('uploadImage success');
          },
          function () {
            console.log('uploadImage error');
          });
      },
      function (error) {
        self.hideLoading();
        console.error('getPhoto error', error);
      });
    // .then(
    //   function (response) {
    //     console.log('GETPHOTO SUCCESS', response);
    //   },
    //   function (error) {
    //     console.log('GETPHOTO ERROR');
    //   });
  };

  self.showLoading = function(message) {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner><div style="margin-top:5px">'+message+'</div>'
    });
  };
  
  self.hideLoading = function(){
    $ionicLoading.hide();
  };
});
