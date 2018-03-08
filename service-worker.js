self.addEventListener("install", function(e) {
    e.waitUntil(
        caches.open('bookmarkdown-cache').then(function(cache) {
            cache.addAll([
                '/bookmarkdown/index.html',
                '/bookmarkdown/scripts/main.js',
                '/bookmarkdown/assets/style.css',
                '/bookmarkdown/assets/queries.css'
            ]);
        })
    );
});

self.addEventListener('fetch', function(e) {
    console.log(e.request.url);
    e.respondWith(
        caches.match(e.request).then(function(response) {
            return response || fetch(e.request);
        })
    );
});