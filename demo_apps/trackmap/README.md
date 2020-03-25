trackmap$ cd client
trackmap/client$ npm start

<http://localhost:5000/?notation=out/albatross-transformation.json&load=out/albatross-data.json>

trackmap$ cd server
trackmap/server$ npm start

<http://localhost:5000/?notation=out/albatross-transformation.json&socket=localhost:3000>

demo_data/animals$ ./analyse.py

<http://localhost:5000/?notation=out/indoor-transformation.json&socket=localhost:3000>

demo_data/indoor$ ./stream track_alice
demo_data/indoor$ ./stream track_bob

