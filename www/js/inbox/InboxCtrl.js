// Inbox controller
angular.module('snapcache.inbox', [])

.controller('InboxCtrl', function () {
  var self = this;
  self.caches = [];

  // temporarily hard-coded data, until Firebase service is up
  self.items = [
    {
      createdAt: new Date(2015,01,31),
      availDate: new Date(2015,04,07),
      availDuration: 172800000,
      title: 'It\'s your birthday!'
    },
    {
      createdAt: new Date(2015,02,31),
      availDate: new Date(2015,04,31),
      availDuration: 172800000,
      title: 'Super Fred'
    }
  ];

  self.displayCaches = function () {
    // access list of incoming caches for logged in user
    //   - using userid stored in a .value on main app?
    //   - using method on Firebase Factory or Inbox Factory?
    //     This method will get a subset of all caches, based on cache IDs
    //     stored as incoming caches for that user
    // Caches.getReceived();
    // on success:
    //   save this list to a property on this controller, for use with ng-repeat?
    // on error:
    //   console.error for debugging
  };

  self.showCacheDetail = function () {
    // on selection of a particular cache in the list, show that cache's details
    // in a modal?
  };

  // need to have a countdown showing. This may be a filter on the main
  // app file. Moment.js plus Countdown.js plus moment-countdown??

  // show days left if above x days
  // show hours, minutes if above
  // show seconds if below x minutes

  // moment.duration(x).humanize()
});
