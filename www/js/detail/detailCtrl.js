// Cache Detail Module
angular.module('snapcache.detail', [])

// Detail controller
.controller('DetailCtrl', function ($scope, $ionicModal, Caches) {
  var self = this;
  self.cache = {};

  // create the detail modal based on the view html
  $ionicModal.fromTemplateUrl('js/detail/detail.html', {
    scope: $scope
  }).then(function(modal) {
    self.modal = modal;
  });

  // shows the cache detail modal view
  self.showDetail = function(cacheID) {
    Caches.getCacheDetail(cacheID).then(
      function (cacheData) {
        self.cache = cacheData;
        self.modal.show();
      },
      function (error) {
        console.error('showDetail error', error);
      });
  };

  // closes the cache detail modal view
  self.closeDetail = function() {
    self.modal.hide();
  };

  // TODO: decide when to call [remove()](http://ionicframework.com/docs/api/controller/ionicModal/) on the modal, to clean it up and ensure no memory leaks. This could happen when the model gets closed, or potentially on the event [$ionicView.afterLeave](http://ionicframework.com/docs/api/directive/ionView/). 

  // The following remove() call is taken straight from Ionic's tutorial on modals. Perhaps change $destroy to $ionicView.afterLeave, since this view might get cached and thus not removed to trigger that $destroy.
  // self.$on('$destroy', function() {
  //   self.modal.remove();
  // });
});
