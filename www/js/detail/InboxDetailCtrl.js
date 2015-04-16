// Cache Detail Module
angular.module('snapcache.detail.inbox', [])

// Detail controller
.controller('InboxDetailCtrl', function (userSession) {
  var self = this;
  self.cache = userSession.currentCache;
  self.items = [];

  // Load the cache's objects into an array
  var items = self.cache.contents;
  for (var id in items) {
    self.items.push(items[id]);
  }
});
