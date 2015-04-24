angular.module('snapcache.services.giphy', [])

.factory('Giphy', function($http, $q){
  return {
    searchGIF: searchGIF
  };

  function searchGIF(term) {
    var deferred = $q.defer();

    // Construct the query query string to send to Giphy
    // TODO: Need to encode search term for URL
    queryString = term.split(" ").join("+");
    var url = 'http://api.giphy.com/v1/gifs/search?q=' + queryString +
              '&api_key=dc6zaTOxFJmzC&limit=1';

    // Send a call to the [Giphy API](https://github.com/giphy/GiphyAPI)
    $http.get(url)
      .success(function(response) {
        // Check to see if any results are returned. Otherwise,
        // return the empty string for the gif url.
        if (response.data.length) {
          var topResult = response.data[0];
          var gifUrl = topResult.images.fixed_height.url;
          deferred.resolve(gifUrl);
        } else {
          deferred.resolve('');
        }
      })
      .error(function(data){
        deferred.reject('error in call to giphy API');
      });
    return deferred.promise;
  }

});


