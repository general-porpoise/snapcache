var firebaseServices = angular.module('snapcache.services.firebase', []);

firebaseServices.factory('Caches', function($http){

  return {
    getAll: getAll,
    create: create
  }

  function getAll() {
    console.log('Get all caches!');
  }

  function create() {
    console.log('Create a cache!');
  }

});