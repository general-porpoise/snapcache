// Inbox controller
angular.module('snapcache.inbox', [])

.controller('InboxCtrl', function() {
  var self = this;

  self.items = [
    {
      title: 'Best snapcache ever',
      description: 'That awkward moment when...',
      createdBy: 'Sunny'
    }
  ];

});
