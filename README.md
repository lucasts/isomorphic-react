Isomorphic JavaScript Example
===================

This is a small sample app built with react, react-router, fluxible-app, webpack, react-hot-loader and spotify search api to demonstrate isomorphic JavaScript concepts.

Credits to https://github.com/alexaivars/isomorphic-react for original code base

### Install dependenices

		$ npm install

### Run the app in dev mode!

This starts up the server and webpack's dev server with hot reloading

		$ npm run start-dev

### Run the app in prod mode!

This builds production assets and start the server in production mode

    $ npm start

### TODO 

1. Running production builds - precompiling webpack into a 'build' folder (done)
2. Production builds should support cache-busting (done)
3. Production builds should support commons chunk and page specific chunks. 
4. Builds should also support asynchronous script loading with React router.
5. Handle non-JS builds.