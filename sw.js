let staticCacheName = 'gwg_mws_project_1_static_v1';
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/restaurant.html',
        '/data/restaurants.json',
        '/js/',
        '/js/main.js',
        '/js/restaurant_info.js',
        '/js/dbhelper.js',
        '/css/styles.css',
        '/img/',
        '/img/1.jpg',
        '/img/2.jpg',
        '/img/3.jpg',
        '/img/4.jpg',
        '/img/5.jpg',
        '/img/6.jpg',
        '/img/7.jpg',
        '/img/8.jpg',
        '/img/9.jpg',
        '/img/10.jpg'
      ]).then(function(){
        console.log('cache added successfully');
      }).catch(function(e) {
        console.log('error in adding cache : ' + e); 
        
      })
    })
  );
});


self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        console.log('Found ', event.request.url, ' in cache');
        return response;
      }
      console.log('Network request for ', event.request.url);
     
      return fetch(event.request).then(function(response) {
        let responseClone = response.clone();
        caches.open('gwg_mws_project_1_static_v1').then(function(cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      });

    }).catch(function(error) {

      console.log('cache match error:' + error);

    })
  );
});