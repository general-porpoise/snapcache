// Cache Detail Module
angular.module('snapcache.detail.outbox', [])

.filter('cropImgUrl', function() {
  // Cloudinary allows you do apply transformations before grabbing
  // them. Here, we are getting a square (size x size) version of our
  // image, retaining the original proportions (cropping the image).
  //
  // However, our image might come from an external source, such as
  // giphy, so we need to check for that.
  return function(url) {
    if (url.indexOf('cloudinary') !== -1) {
      var index = url.indexOf('/upload/') + 8;
      var endIndex = url.indexOf('/', index);
      var start = url.substr(0, index);
      var end = url.substr(endIndex);
      return start + 'w_' + 1000 + ',h_' + 1000 + ',c_fill' + end;
    } else {
      return url;
    }
  };
})

// Detail controller
.controller('OutboxDetailCtrl', function ($scope, $ionicModal, $ionicLoading, $firebaseArray, userSession, Caches, Camera, Cloudinary, Giphy, FIREBASE_REF, $ionicActionSheet) {
  var self = this;
  self.cache = userSession.currentCache;

  // Setting up AngularFire
  var cacheRef = new Firebase(FIREBASE_REF).child('caches').child(self.cache._id);
  self.items = $firebaseArray(cacheRef.child('contents'));
  self.isContributable = (Date.now() < self.cache.droptime);
  self.contentToAdd = {};

  // `addContent()` will take the content of an additional message that the user
  // wants to contribute to the cache, add it, and save it to Firebase.
  self.addContent = function() {

    // To add Giphy integration, we need to see if the user has submitted
    // text that starts with /giphy, and if so, search for the term
    // and set the correct property.
    var textInput = self.contentToAdd.text;
    if (textInput && /^\/giphy/.test(textInput)) {
      var searchTerm = textInput.split("/giphy").join("").slice(1);
      Giphy.searchGIF(searchTerm).then(function(gifURL){
        self.contentToAdd.imgURL = gifURL;
        addTextOrPhoto();
      });
    } else {
      addTextOrPhoto();
    }
  };

  function addTextOrPhoto() {
    var type = '';
    var message = '';
    var contribution = {
      contributor: userSession.name,
      profileUrl: userSession.profileUrl,
      content: {
        createdAt: new Date().toDateString()
      }
    };
    // Set contribution's type based on user-submitted content
    if (self.contentToAdd.imgURL) {
      contribution.content.type = 'image';
      contribution.content.imgURL = self.contentToAdd.imgURL;
    } else {
      contribution.content.type = 'text';
    }

    // Set message on content only if user has added text
    if (self.contentToAdd.text) {
      contribution.content.message = self.contentToAdd.text;
    }

    console.log('CONTRIBUTION');
    console.dir(contribution);

    // Using Angular Fire for 3 way data binding
    self.items.$add(contribution);

    // Remove the user input
    self.contentToAdd = {};
  }

  // 'getPhoto()' opens the camera for picture taking and ...
  self.getPhoto = function (sourceType) {
    console.log('GET PHOTO');
    Camera.getPicture({
      sourceType: sourceType,
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
            self.contentToAdd.imgURL = response.url; // could be secure_url if we need https
            self.addContent();
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


  // Show & hide loading spinner
  self.showLoading = function(message) {
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner><div style="margin-top:5px">'+message+'</div>'
    });
  };

  self.hideLoading = function(){
    $ionicLoading.hide();
  };

  // Action sheet for selecting content to add
  self.showContentActionSheet = function () {
    var hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: 'Post a Photo' },
        { text: 'Post Existing Photo' }
      ],
      cancelText: 'Cancel',
      cancel: function () {
        hideSheet();
      },
      buttonClicked: function(index) {
        if (index === 0) {
          console.log('Take Photo clicked');
          self.getPhoto(navigator.camera.PictureSourceType.CAMERA);
        } else if (index === 1) {
          console.log('Choose from Library clicked');
          self.getPhoto(navigator.camera.PictureSourceType.PHOTOLIBRARY);
        }
        return true;
      }
    });
  };

  // Creating the modal associated with inviting the other
  // contributors.
  $ionicModal.fromTemplateUrl('js/detail/outboxInvite.html', {
    scope: $scope,
    animation: 'slide-in-up',
  }).then(function(modal){
    self.inviteModal = modal;
  });

  self.openInvite = function() {
    self.inviteModal.show();
  };

  self.closeInvite = function() {
    self.inviteModal.hide();
  };

  $scope.$on('$destroy', function(){
    self.inviteModal.remove();
  });
});
