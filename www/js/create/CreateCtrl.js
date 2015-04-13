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

.controller('CreateCtrl', function($filter, $scope, $ionicModal, $timeout, Caches, UserFriends, userSession) {

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

  // Default value for cache radius will be 1 mile
  self.radius_slider = 5280;

  // Cache will have the `discovered` property set to false
  self.properties.discovered = false;

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
    self.properties.coordinates = {
      latitude: userSession.position.coords.latitude,
      longitude: userSession.position.coords.longitude
    };
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

  // not currently used
  self.initializeMap = function() {
    var myLatlng = new google.maps.LatLng(37.3000, -120.4833);

    var mapOptions = {
      center: myLatlng,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById("map"), mapOptions);

    navigator.geolocation.getCurrentPosition(function(pos) {
      console.log(pos);
      map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
      var myLocation = new google.maps.Marker({
        position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
        map: map,
        title: "My Location"
      });
    });

    self.map = map;

    var search = new google.maps.places.SearchBox(document.getElementById("map-search"), {});
    google.maps.event.addListener(search, 'places_changed', function() {
      var places = search.getPlaces();
      console.log("places changed:", places);
      self.properties.coordinates = {
        latitude: places[0].geometry.location.k,
        longitude: places[0].geometry.location.D
      };
    });
  };

  // Not used at the moment, potential fix for map search box issue
  self.update = function() {
    $timeout(function() {
      var container = document.querySelector('.pac-container');
      container.setAttribute('data-tap-disabled', 'true');
      container.onclick = function() {
        document.getElementById('autocomplete').blur();
      }
      var placeNodes = document.querySelectorAll('.pac-item');
      console.log('place nodes:', placeNodes);
      for(var i = 0; i < placeNodes.length; i++) {
        console.log(placeNodes[i]);
        placeNodes[i].addEventListener('click', function() {
          console.log('clicked');
        });
      }
    }, 400);
  };

});
