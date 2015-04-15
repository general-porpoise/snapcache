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
    var text = {
      message: text,
      contributor: userSession.name
    };
    // Push the added message into the texts array so that the view
    // dynamically updates.
    self.texts.push(text);

    // Need to also add it to the cache, so that the view will remain consistent
    // as the user switches in and out of the outbox detail.
      // NOTE: We just use a random id to replicate the structure that Firebase
      // uses. This should be fine for the case where the user logs in.
    self.cache.contents.text[Math.random()] = text;
  };
});
