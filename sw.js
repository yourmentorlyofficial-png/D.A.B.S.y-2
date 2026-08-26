/* =====================================================
   D.A.B.S.y SERVICE WORKER
===================================================== */

const CACHE_NAME =
  "dabsy-v8-creature";


const CORE_FILES = [

  "./",

  "./index.html",

  "./styles.css",

  "./app.js",

  "./manifest.json"

];


/* =====================================================
   INSTALL
===================================================== */

self.addEventListener(
  "install",
  event => {

    event.waitUntil(

      caches
        .open(CACHE_NAME)
        .then(
          cache =>
            cache.addAll(
              CORE_FILES
            )
        )
        .then(
          () =>
            self.skipWaiting()
        )

    );

  }
);


/* =====================================================
   ACTIVATE
===================================================== */

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
                    key !==
                    CACHE_NAME
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


/* =====================================================
   FETCH
===================================================== */

self.addEventListener(
  "fetch",
  event => {

    if (
      event.request.method !==
      "GET"
    ) {

      return;

    }


    /*
      Network first.

      This is important because
      GitHub Pages should be able
      to deliver new versions without
      the old app being resurrected.
    */

    event.respondWith(

      fetch(
        event.request
      )

        .then(
          response => {

            const copy =
              response.clone();


            caches
              .open(
                CACHE_NAME
              )
              .then(
                cache =>
                  cache.put(
                    event.request,
                    copy
                  )
              )
              .catch(
                () => {}
              );


            return response;

          }
        )

        .catch(
          () =>
            caches.match(
              event.request
            )
        )

    );

  }
);
