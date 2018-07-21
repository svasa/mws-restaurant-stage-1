if ('serviceWorker' in navigator) {
  console.log("Yes serviceWorker in navigator");
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(reg) {
         console.log('Service worker registered' + reg.scope );
      }).catch( function(err) {
        console.log('Service worker failed to register' + err );
      })
  });
}