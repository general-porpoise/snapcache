angular.module('snapcache.config', [])

.factory('CloudinaryConfig', function() {

  var cloudName = 'dladwkrpp';
  var url = 'https://api.cloudinary.com/v1_1/'+ cloudName +'/image/upload';
  var apiKey = 687729749567152;
  var secret = '6m9XMmAsU7lBx7E6i3gcaTrpm0I';

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
