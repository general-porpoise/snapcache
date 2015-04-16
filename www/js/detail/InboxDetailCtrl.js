// Cache Detail Module
angular.module('snapcache.detail.inbox', [])

// Detail controller
.controller('InboxDetailCtrl', function (userSession) {
  var self = this;
  self.cache = userSession.currentCache;
  self.texts = [];

  // Load the cache's text objects into an array
  var texts = self.cache.contents.text;
  for (var id in texts) {
    self.texts.push(texts[id]);
  }
});
