// Cache Detail Module
angular.module('snapcache.detail.outbox', [])

// Detail controller
.controller('OutboxDetailCtrl', function (userSession) {
  var self = this;
  self.cache = userSession.currentCache;
  self.texts = [];

  // Load the cache's text objects into an array
  // NOTE: Currently, the assumed object structure is the following:
  //  - CacheID
  //    - contents
  //      - text
  //        - ContributionID
  //          - contributor
  //          - message
  var texts = self.cache.contents.text;
  for (var id in texts) {
    self.texts.push(texts[id]);
  }

  self.addText = function(text) {
    // Push the added message into the texts array so that the view
    // dynamically updates.
    self.texts.push({
      message: text,
      contributor: userSession.name
    });
  };
});
