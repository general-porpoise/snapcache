// Create Controller
angular.module('snapcache.create', [])

.controller('CreateCtrl', function($scope, $ionicModal, $timeout, Caches, UserFriends, userSession) {

  var self = this;
  self.properties = {};

  // Allow the user to search through the list of their friends
  // TODO: Currently userSession.friends is hard-coded and we will want to
  //       use live data.
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
