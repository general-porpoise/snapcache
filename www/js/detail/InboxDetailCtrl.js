// Cache Detail Module
angular.module('snapcache.detail.inbox', [])

// Detail controller
.controller('InboxDetailCtrl', function (userSession) {
  var self = this;
  self.cache = userSession.currentCache;
  self.items = [];

  // Load the cache's objects into an array.
  var items = self.cache.contents;
  for (var id in items) {
    self.items.push(items[id]);
  }
})

.filter('cropImgUrl', function() {
  // Cloudinary allows you to apply transformations before grabbing
  // them. Here, we are getting a square (size x size) version of our
  // image, retaining the original proportions (cropping the image).
  return function(url) {
    var index = url.indexOf('/upload/') + 8;
    var endIndex = url.indexOf('/', index);
    var start = url.substr(0, index);
    var end = url.substr(endIndex);
    return start + 'w_' + 1000 + ',h_' + 1000 + ',c_fill' + end;
  };
});
