// Our super secret API keys will live here...
// Uncomment and replace relevant fields with your credentials,
// then save as config.js in this directory

angular.module('snapcache.config', [])

.factory('CloudinaryConfig', function() {

  var cloudName = 'CLOUD_NAME';
  var url = 'https://api.cloudinary.com/v1_1/'+ cloudName +'/image/upload';
  var apiKey = API_KEY;
  var secret = SECRET;

  // Cloudinary needs a SHA1-hashed signature to authenticate uploads
  var getSignature = function(timestamp) {
    // info on CryptoJS at https://code.google.com/p/crypto-js/#SHA-1
    // the docs leave out that you need to use toString to get the actual hash
    return CryptoJS.SHA1('timestamp=' + timestamp + '' + secret).toString();
  };

  return {
    cloudName: cloudName,
    url: url,
    apiKey: apiKey,
    secret: secret,
    getSignature: getSignature
  };
});
