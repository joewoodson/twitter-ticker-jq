$(document).ready(function() {

  var running = false;
  var rootUrl = 'https://api.twitter.com/1.1/';
  var proxyUrl = 'https://joe-p.herokuapp.com/';
  var currentList = [];
  var updatedHtml = '';

  var $webTicker = $('#webTicker');

  var fetchIntervalId = setInterval(fetchData, 10000);
  var speed = (getParameterByName('speed') && !isNaN(getParameterByName('speed'))) ? getParameterByName('speed') : 90;
  var mode = getParameterByName('mode');

  //grab initial data, either from local storage or api, and set config vars
  var favorites = localStorage.getItem('tweets');
  if (favorites) {
    var savedFavorites = JSON.parse(favorites);
    createFavoritesList(savedFavorites);
    currentList = savedFavorites;
  } else {
    fetchData();
  }

  $('#stop-ticker').click(function() {
    if ($webTicker) $webTicker.webTicker('stop');
  });

  $('#start-ticker').click(function() {
    if ($webTicker) $webTicker.webTicker('cont');
  });

  // check if last element is at right edge of screen, which means list can be updated
  setInterval(function() {

      if (!running) {
        running = true;
        initTicker();

        $webTicker.webTicker('update',
          updatedHtml,
          'swap',
          true,
          true
        );
        console.log('updated');
        updatedHtml = '';
      }

      if (jQuery('.tweet')[0]) {
        var rt = ($(window).width() - ($('.last').offset().left + $('.last').outerWidth()));
        if ( rt > -10 && rt < 10 ) {
          console.log('can update!');

          if (!running) {
           running = true;
           initTicker();
          }

          if (updatedHtml) {
            var updatedWidth = getUpdatedWidth(updatedHtml);
            var widthDiff = $webTicker.width() - getUpdatedWidth(updatedHtml);
          }

          if (updatedHtml) {
            var currentLeft = $webTicker.css("left").replace('px', '');
            var newLeft = (currentLeft + widthDiff).toString + 'px';

            console.log('curr: ' + currentLeft);
            console.log('new: ' + newLeft);

          //  $webTicker.css({ left: newLeft });
           $webTicker.webTicker('update',
             updatedHtml,
             'swap',
             true,
             true
           );
           $webTicker.webTicker('stop');
           console.log('updated');
           updatedHtml = '';
          } else {
           console.log('nothing to update');
          }
        }

      }
  }, 100);

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
    if (mode !== 'offline') {
      $.ajax(proxyUrl + rootUrl +'favorites/list.json?&tweet_mode=extended&screen_name=joewdsn&count=3', {
          headers: {
            Authorization: 'Bearer AAAAAAAAAAAAAAAAAAAAAC7k2QAAAAAAUGifZBfJhkrz2xTH6o4f0F0KQcA%3DIqMxALOukBJv8V77TeGVsuGxwxlTKu3B1S8KUW3628TN3RrNSt'
          },
          success: function(data) {
            var favorites = data.reverse();
            console.log('favorites fetched...');
            createFavoritesList(favorites);
            currentList = favorites;
            localStorage.setItem('tweets', JSON.stringify(favorites));
          },
          error: function(req, status, err) {
            console.log('Error: ' + err);
            console.log('currently running in offline mode...');
          }
       });
     } else {
       console.log('running in offline mode; remove query param to update tweets');
     }
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

   function createTweet(favorite, isLast){
     var text = favorite.full_text;
     if (favorite.entities.urls[0]) {
       text = text.replace(favorite.entities.urls[0].url, '');
     }

     if (favorite.extended_entities) {
       text= text.replace(favorite.extended_entities.media[0].url, '');
     }

     var mediaUrl = favorite.entities.media ? favorite.entities.media[0].media_url_https : null;
     var attachedImg = mediaUrl ? '<img class="image-attached" src="' + mediaUrl + '" />' : '';
     var liClass = isLast ? 'last tweet' : 'tweet';

     return '<li data-update="item' + favorite.id_str + '" class="' + liClass + '"><img src="' + favorite.user.profile_image_url + '" /> <span class="author">@' + favorite.user.screen_name + ':</span> <span class="text">' + text + '</span>' + attachedImg + '</li>'
   }

   function createFavoritesList(favorites){
     var favoritesHtml = '';

     for (var i = 0; i < favorites.length; i++) {
       var isLast = i === favorites.length - 1;

       favoritesHtml += createTweet(favorites[i], isLast);
     }

     if (!compareLists(currentList, favorites)) {
       updatedHtml = favoritesHtml;
       // need to get only the new ones instead
       getUpdatedWidth(favoritesHtml);
     }
   }

   function getUpdatedWidth(html){
    var updates = $(html).css('display','none').appendTo('body');
    var updatesWidth = updates.width();
    updates.remove();
    // console.log(updatesWidth);
    return updatesWidth;
   }

});
