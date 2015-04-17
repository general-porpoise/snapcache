// Cache Detail Module
angular.module('snapcache.detail.outbox', [])

// Detail controller
.controller('OutboxDetailCtrl', function (userSession, Caches, Camera, Cloudinary, $ionicLoading) {
  var self = this;
  self.cache = userSession.currentCache;
  self.items = [];
  self.isContributable = (Date.now() < self.cache.droptime);

  // Load the cache's objects into an array
  // NOTE: Currently, the assumed object structure is the following:
  //  - CacheID
  //    - contents
  //        - ContributionID
  //          - contributor
  //          - content
  //            - type
  //            - value specific to type
  var items = self.cache.contents;
  for (var id in items) {
    self.items.push(items[id]);
  }

  // `addText()` will take the text of an additional message that the user
  // wants to contribute to the cache, add it, and save it to Firebase.
  self.addText = function(text) {
    var contribution = {
      contributor: userSession.name,
      content: {
        type: "text",
        message: text
      }
    };
    // Push the added message into the texts array so that the view
    // dynamically updates.
    self.items.push(contribution);

    // Need to also add it to the cache, so that the view will remain consistent
    // as the user switches in and out of the outbox detail.
      // NOTE: We just use a random id to replicate the structure that Firebase
      // uses. This should be fine for the case where the user logs in.
    self.cache.contents[Math.random()] = contribution;

    // Send the additional cache contribution to Firebase.
    Caches.addContribution(self.cache._id, contribution);

    // Remove the user input
    self.text = '';
  };

  // 
  self.addPhoto = function (imageURL) {
    console.log('imageURL', imageURL);
  };

  // 'getPhoto()' opens the camera for picture taking and ...
  self.getPhoto = function () {
    console.log('GET PHOTO');
    Camera.getPicture({
      destinationType: navigator.camera.DestinationType.DATA_URL,
      targetHeight: 1500,
      targetWidth: 1500,
      quality: 25 // set below 50 to avoid iOS memory errors
    })
    .then(
      function (image) {
        self.showLoading('Uploading...');
        Cloudinary.uploadImage(image)
          .success(function (response) {
            console.log('SUCCESSFUL POST TO CLOUDINARY');
            self.hideLoading();            
            self.addPhoto(response.url); // could be secure_url if we need https

          }).error(function(error) {
            console.log('ERROR POSTING TO CLOUDINARY');
            console.error('getPhoto error', error);

            self.hideLoading();
          });
      },
      function (error) {
        self.hideLoading();
        console.error('getPhoto error', error);
      });
  };

  self.showLoading = function(message) {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner><div style="margin-top:5px">'+message+'</div>'
    });
  };
  
  self.hideLoading = function(){
    $ionicLoading.hide();
  };

});
