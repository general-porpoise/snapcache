// Cache Detail Module
angular.module('snapcache.detail.outbox', [])

// Detail controller
.controller('OutboxDetailCtrl', function (userSession) {
  var self = this;
  self.cache = userSession.currentCache;
});
