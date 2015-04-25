angular.module('snapcache.services.camera', [])

.factory('Camera', ['$q', function($q) {

  var getPicture = function(options) {
      var deferred = $q.defer();

      navigator.camera.getPicture(function(result) {
        deferred.resolve(result);
      }, function(error) {
        deferred.reject(error);
      }, options);

      return deferred.promise;
    };

  return {
    getPicture: getPicture
  };
}]);
