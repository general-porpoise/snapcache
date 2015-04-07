// Create Controller
angular.module('snapcache.create', [])

.controller('CreateCtrl', function() {

  var self = this;

  self.properties = {};

  self.submitNewCache = function() {
    console.log('New cache submitted');
  };

});
