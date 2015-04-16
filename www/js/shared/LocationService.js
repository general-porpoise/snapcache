// Location is a factory that gives functionality associated with getting
// a users caches (but contributable and received ones), and creating
// new ones.
angular.module('snapcache.services.location', [])

.factory('Location', function(){

  return {
    getAddress: getAddress
  };

  function getAddress(lat, lon) {
    return 'yay it is working!';
  }

});
