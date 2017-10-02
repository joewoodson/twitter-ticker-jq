$(document).ready(function() {

  var running = false;
  var rootUrl = 'https://api.twitter.com/1.1/';
  var proxyUrl = 'https://joe-p.herokuapp.com/';
  var currentList = [];

  var $webTicker = $('#webTicker');

  //grab initial data;
  fetchData();
  var fetchIntervalId = setInterval(fetchData, 60000);

  function initTicker(){
    $webTicker.webTicker({
      speed: 410,
      height: '64px',
      hoverpause: false,
      duplicate: true,
    });
  }

  function fetchData(){
    $.ajax(proxyUrl + rootUrl +'favorites/list.json?&tweet_mode=extended&screen_name=joewdsn&count=10', {
        headers: {
          Authorization: 'Bearer AAAAAAAAAAAAAAAAAAAAAC7k2QAAAAAAUGifZBfJhkrz2xTH6o4f0F0KQcA%3DIqMxALOukBJv8V77TeGVsuGxwxlTKu3B1S8KUW3628TN3RrNSt'
        },
        success: function(data) {
          var favorites = data.reverse();
          console.log('favorites fetched...');
          updateFavorites(favorites);
          currentList = favorites;
        },
        error: function(req, status, err) {
          console.log('Error: ' + err);
        }
     });
   }

   function updateFavorites(favorites){
     var favoritesHtml = '';

     for (var i = 0; i < favorites.length; i++) {
       favoritesHtml += '<li data-update=item' + favorites[i].id_str + ' class="tweet">' + favorites[i].full_text + '</li>';
     }

     if (!running) {
       running = true;
       initTicker();
     }

     if (favorites === currentList) {
       console.log('no updates!');
     }

     if (favorites !== currentList) {
       $webTicker.webTicker('update',
         favoritesHtml,
         'swap',
         true,
         true
       );
     }
   }

});
