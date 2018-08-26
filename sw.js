(function () {
    if (typeof idb === "undefined") {
        self.importScripts('/idb.js');
    }
})();
var staticCacheName = 'gwg_mws_project_1_static_v1';
const dbPromise = idb.open( 'restaurant-db', 1, function( upgradeDb ) {
      var keyValStore = upgradeDb.createObjectStore('restaurants', {
        keyPath: 'id'
      });
 }) 
var DATABASE_URL;
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/restaurant.html',
        '/js/',
        '/js/main.js',
        '/js/restaurant_info.js',
        '/js/dbhelper.js',
        '/css/styles.css',
        'idb.js',
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


self.addEventListener('activate', function(event) {
  console.log('SW activated');
  event.waitUntil(
    initIDB()
  );
});

self.addEventListener('fetch', function(event) {
     //console.log( "In SW event request is " + event.request.url);
     const url = new URL(event.request.url);
     if( url.port === '1337' ) {
         const splitted = url.pathname.split("/");
         const id = splitted[splitted.length-1] === "restaurants" ? -1 : splitted[splitted.length-1];
     
         event.respondWith( 
           dbPromise.then( function(db) {
               var tx1 = db.transaction("restaurants");
               var store1 = tx1.objectStore("restaurants");
               var res = store1.get('' + id);
               //console.log( "For id = " + id + " type of res is : " + (typeof(res)) + " res.data is : " + res.data );
               return res;
           }).then( function(result) {
             if ( result && result.data ) {
               //console.log( "Returning data from IDB");
               return result.data;
             }
             return( fetch( event.request )
                      .then( function( fetchResponse ) {
                        fetchResponse.json().then( function( json ) {
                          return dbPromise.then( function(db) {
                            var tx2 = db.transaction("restaurants", "readwrite");
                            var store2 = tx2.objectStore("restaurants");
                            //console.log( "Writing to IDB...");
                            //console.log( "ID : " + id );
                            //console.log( "JSON: " + json );
                            store2.put( {
                              id: '' + id,
                              data: json
                            });
                            console.log(json);
                            return json;

                          });
                         })
                       }
                      )
                   );
           }).then( function(swResponse) {
             return new Response( JSON.stringify( swResponse ) );

           }).catch( function( error ) {
             //console.log( "Error when fetching from idb : " + error );
             return new Response( "Error fetching data from sw for idb responses", { status : 500 } );
           })
        );
               
     } else {
       
      event.respondWith(
        caches.match(event.request).then(function(response) {
          if (response) {
            //console.log('Found ', event.request.url, ' in cache');
            return response;
          }
          //console.log('Network request for ', event.request.url);

          return fetch(event.request).then(function(response) {
            let responseClone = response.clone();
            caches.open(staticCacheName).then(function(cache) {
              cache.put(event.request, responseClone);
            });
            return response;
          });

        }).catch(function(error) {

          console.log('cache match error:' + error);

        })
   
      );
   }
});


function initIDB() {

    dbPromise.then( function(db) {
        if(!db) return;
        const port = 1337;
        DATABASE_URL = `http://localhost:${port}/restaurants`;
        fetch( DATABASE_URL ).then( function( response ) {
          if ( response ) {
            response.json().then(function(restaurants) {
             dbPromise.then( function(db2) {
                var index = -1;
                var tx = db.transaction('restaurants', 'readwrite');
                var store = tx.objectStore('restaurants');
                store.put( {
                  id : '' + index,
                  data: restaurants
                });
                return restaurants;
              }).then( function(rests) {
                dbPromise.then(function(db2) {
                  var tx2 = db2.transaction('restaurants', 'readwrite');
                  var store2 = tx2.objectStore('restaurants');
                  var i = 0;
                  rests.forEach(function(rest) {
                     var index = ++i;
                     store2.put( {
                       id: '' + index,
                       data: rest 
                     });
                  })
                })

              })
              
               
           })
          }
        })

        
    })
}
