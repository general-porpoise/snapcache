// Inbox module
angular.module('snapcache.inbox', [])

// Custom filter for applying moment.js to create a countdown
.filter('countdown', function () {
  return function (dateString) {
    return moment(dateString).fromNow(true);
  };
})

// Inbox controller
.controller('InboxCtrl', function (userSession) {
  var self = this;
  self.caches = {};

  // temporarily hard-coded data, until Firebase service is up, create feature is working, and GeoFire service sets a timestamp for when a cache becomes available (pops) to the user.
  self.items = [
    {
      createdAt: new Date(2015,01,31),
      availDate: new Date(2015,03,07),
      availDuration: 172800000,
      title: 'Surprise...',
      poppedAt: new Date(2015,03,08,12,28,0),
      // the expiresAt value will need to be calculated by the GeoFire service at time of pop:
      expiresAt: new Date(2015,03,09,09,0,0) 
    },
    {
      createdAt: new Date(2015,02,31),
      availDate: new Date(2015,03,31),
      availDuration: 172800000,
      title: 'April Freds!',
      poppedAt: new Date(2015,03,08,15,48,0),
      expiresAt: new Date(2015,03,12,0,0,0)
    },
    {
      title: 'Thinking of you',
      expiresAt: new Date(2015,03,15,12,0,0)
    }
  ];

  // Retrieve list of incoming caches for logged-in user and store them for
  // use by ng-repeat in view.
  self.displayCaches = function () {
    Caches.getReceived(userSession.uid).then(
      function (receivedCaches) {
        self.caches = receivedCaches;
      },
      function (error) {
        console.error('displayCaches erorr', error);
      });
  };

  self.showCacheDetail = function () {
    // on selection of a particular cache in the list, show that cache's details
    // in a modal?
  };
});
