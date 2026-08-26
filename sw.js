const CACHE =
  "dabsy-final-v2";

const FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icon.svg"
];


self.addEventListener(
  "install",
  event => {

    event.waitUntil(

      caches
        .open(CACHE)
        .then(
          cache =>
            cache.addAll(
              FILES
            )
        )
        .then(
          () =>
            self.skipWaiting()
        )

    );

  }
);


self.addEventListener(
  "activate",
  event => {

    event.waitUntil(

      caches
        .keys()
        .then(
          keys =>
            Promise.all(

              keys
                .filter(
                  key =>
                    key !== CACHE
                )
                .map(
                  key =>
                    caches.delete(
                      key
                    )
                )

            )
        )
        .then(
          () =>
            self.clients.claim()
        )

    );

  }
);


self.addEventListener(
  "fetch",
  event => {

    const request =
      event.request;


    /*
      NEVER cache AI POST requests.
    */

    if (
      request.method !== "GET"
    ) {

      return;

    }


    const url =
      new URL(
        request.url
      );


    /*
      Only handle files belonging
      to the GitHub Pages app.
    */

    if (
      url.origin !==
      self.location.origin
    ) {

      return;

    }


    event.respondWith(

      caches.match(
        request
      )
      .then(
        cached => {

          if (cached) {

            return cached;

          }


          return fetch(
            request
          )
          .then(
            response => {

              if (
                !response ||
                response.status !== 200
              ) {

                return response;

              }


              const copy =
                response.clone();


              caches
                .open(CACHE)
                .then(
                  cache =>
                    cache.put(
                      request,
                      copy
                    )
                );


              return response;

            }
          );

        }
      )

    );

  }
);
