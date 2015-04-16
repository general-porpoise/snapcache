angular.module('snapcache.services.camera', [])

.factory('Camera', ['$q', function($q) {

  return {
    getPicture: function(options) {
      var deferred = $q.defer();

      navigator.camera.getPicture(function(result) {
        // Do any magic you need
        deferred.resolve(result);
      }, function(error) {
        deferred.reject(error);
      }, options);

      return deferred.promise;
    }
  };
}]);
