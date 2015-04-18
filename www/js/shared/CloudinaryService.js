angular.module('snapcache.services.cloudinary', [])

.factory('Cloudinary', ['$http', 'CloudinaryConfig', function($http, CloudinaryConfig) {

  // Upload image to Cloudinary storage
  // api docs at http://cloudinary.com/documentation/upload_images#remote_upload
  var uploadImage = function(imageURI) {
    var timestamp = +new Date();

    console.log('ABOUT TO POST IMAGE TO CLOUDINARY');

    // return a promise to get url from cloudinary
    return $http.post(CloudinaryConfig.url, {
      // need to specify base64 encoding (see http://stackoverflow.com/questions/24014937/uploading-base64-hashed-image-to-cloudinary
      // and http://en.wikipedia.org/wiki/Data_URI_scheme#JavaScript)
      file: "data:image/jpeg;base64," + imageURI,
      api_key: CloudinaryConfig.apiKey,
      timestamp: timestamp,
      signature: CloudinaryConfig.getSignature(timestamp)
    });
  };

  return {
    uploadImage: uploadImage
  };
}]);
