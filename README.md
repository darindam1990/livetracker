#Order Dispatch Simulation using MapBox with Node/Express backend

**Note: Node/NPM are needed to run this project. Please ensure they are pre-installed before proceeding.**

Run instructions: Download and unzip contents. `cd to <project-directory>/node-server` and run `npm start` to start the server. The UI comes up on [localhost:9001](localhost:9001). Open your favorite browser to visit this page.

This implementation uses **Node/Express** to serve static files. It may be extended to serve richer APIs in the future - for e.g., the forwarding geo-coding API requests could be preprocessed by Node and served through a faster native endpoint.

No other libraries apart from **MapBox** were used in this version.

The codebase also includes unit tests for all the modules - Data/Process/DOM/Map. The tests are written with **Mocha/Chai** and can be run in the browser on [localhost:9001/test](localhost:9001/test)

