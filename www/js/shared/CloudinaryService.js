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
    })
    .success(function (response) {
      console.log('SUCCESSFUL POST TO CLOUDINARY');
      console.log(response);
    }).error(function(error) {
      console.log('ERROR POSTING TO CLOUDINARY');
      console.log(error);
    });
  };

  return {
    uploadImage: uploadImage
  };
}]);

/*
{
  "data":null,
  "status":0,
  "config":{
    "method":"POST",
    "transformRequest":[null],
    "transformResponse":[null],
    "url":"https://api.cloudinary.com/v1_1/dladwkrpp/image/upload",
    "data":{
      "file":"data:image/jpeg;base64Z.........",
      "api_key":687729749567152,
      "timestamp":1429227545025,
      "signature":"cc6f44fe7cff7e3870a0f1361b82f1495cb6736e"
    },
    "headers":{
      "Accept":"application/json, text/plain, *//*",
      "Content-Type":"application/json;charset=utf-8"
    }
  },
  "statusText":""
}
*/
