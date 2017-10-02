$(document).ready(function() {

  var running = false;
  var rootUrl = 'https://api.twitter.com/1.1/';
  var proxyUrl = 'https://joe-p.herokuapp.com/';

  var $webTicker = $('#webTicker');

  //grab initial data;
  fetchData();
  var fetchIntervalId = setInterval(fetchData, 60000);

  function initTicker(){
    $webTicker.webTicker({
      speed: '820',
      height: '64px',
      hoverpause: false,
      duplicate: true,
    });
  }

  function fetchData(){
    $.ajax(proxyUrl + rootUrl +'favorites/list.json?&tweet_mode=extended&screen_name=igbce&count=10', {
        headers: {
          Authorization: 'Bearer AAAAAAAAAAAAAAAAAAAAAC7k2QAAAAAAUGifZBfJhkrz2xTH6o4f0F0KQcA%3DIqMxALOukBJv8V77TeGVsuGxwxlTKu3B1S8KUW3628TN3RrNSt'
        },
        success: function(data) {
          console.log(data);
          for (var i = 0; i < data.length; i++) {
            addFavorite(data[i]);
          }
          if (!running) {
            running = true;
            initTicker();
          }
          // $('#main').html($(data).find('#main *'));
          // $('#notification-bar').text('The page has been successfully loaded');
        },
        error: function(req, status, err) {
          // $('#notification-bar').text('An error occurred');
          console.log('Error: ' + err);
        }
     });
   }

   function addFavorite(favorite){
     var favoriteHtml = '<li>' + favorite.full_text + '</li>';
     $webTicker.append(favoriteHtml);
   }

});
