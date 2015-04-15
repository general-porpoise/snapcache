// Cache Detail Module
angular.module('snapcache.detail.inbox', [])

// Detail controller
.controller('InboxDetailCtrl', function (userSession) {
  var self = this;
  self.cache = userSession.currentCache;
});
