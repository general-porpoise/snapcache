// Cache Detail Module
angular.module('snapcache.detail', [])

// Detail controller
.controller('DetailCtrl', function (userSession) {
  var self = this;
  self.cache = userSession.currentCache;
  console.log('detail created from', self.cache.controller);

});
