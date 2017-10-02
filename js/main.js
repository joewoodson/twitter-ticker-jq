$(document).ready(function() {

  var running = false;
  var rootUrl = 'https://api.twitter.com/1.1/';
  var proxyUrl = 'https://joe-p.herokuapp.com/';
  var currentList = [];

  var $webTicker = $('#webTicker');

  //grab initial data and set config vars
  fetchData();
  var fetchIntervalId = setInterval(fetchData, 60000);
  var speed = (getParameterByName('speed') && !isNaN(getParameterByName('speed'))) ? getParameterByName('speed') : 90;

  function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  function initTicker(){
    $webTicker.webTicker({
      speed: speed,
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

   function compareLists(oldList, newList){
     var same = true;

     for (var i = 0; i < newList.length; i++){
       if (!newList[i] || !oldList[i]) return false;

       if (newList[i].id_str !== oldList[i].id_str) {
         return false;
       }
     }
     return same;
   }

   function createTweet(favorite){
     var text = favorite.full_text;
     if (favorite.entities.urls[0]) {
       text = text.replace(favorite.entities.urls[0].url, '');
     }

     if (favorite.extended_entities) {
       text= text.replace(favorite.extended_entities.media[0].url, '');
     }

     var mediaUrl = favorite.entities.media ? favorite.entities.media[0].media_url_https : null;
     var attachedImg = mediaUrl ? '<img class="image-attached" src="' + mediaUrl + '" />' : '';

     return '<li data-update="item' + favorite.id_str + '" class="tweet"><img src="' + favorite.user.profile_image_url + '" /> <span class="author">@' + favorite.user.screen_name + ':</span> <span className="text">' + text + '</span>' + attachedImg + '</li>'
   }

   function updateFavorites(favorites){
     var favoritesHtml = '';

     for (var i = 0; i < favorites.length; i++) {
      //  favoritesHtml += '<li data-update=item' + favorites[i].id_str + ' class="tweet">' + favorites[i].full_text + '</li>';
       favoritesHtml += createTweet(favorites[i]);
     }

     if (!running) {
       running = true;
       initTicker();
     }

     if (!compareLists(currentList, favorites)) {
       console.log('updated');
       $webTicker.webTicker('update',
         favoritesHtml,
         'swap',
         true,
         true
       );
     } else {
       console.log('no new favorites');
     }
   }

});
