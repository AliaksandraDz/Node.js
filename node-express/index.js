const express = require('express');
const http = require('http');
const morgan = require('morgan');


const hostname = 'localhost';
const port = 3000;

const app = express();
app.use(morgan('dev'));

app.use(express.static(__dirname + '/public'));
//use the following code to serve images, CSS files,
// and JavaScript files in a directory named public.
//to load the files that are in the public directory:
//http://localhost:3000/aboutus.html
// Express looks up the files relative to the static directory,
// so the name of the static directory is not part of the URL.

app.use((req, res, next) => { //<== to start use a middleware
//   console.log(req.headers);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<html><body><h1>This is an Express Server</h1></body></html>');

});

const server = http.createServer(app);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});