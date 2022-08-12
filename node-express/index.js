const express = require('express');
const http = require('http');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');
const hostname = 'localhost';
const port = 3000;

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use('/dishes', dishRouter);
app.use('/dishes/:dishId', dishRouter);
app.use('/promotions', promoRouter);
app.use('/promotions/:promoId', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/leaders/:leaderId', leaderRouter);

// app.all('/dishes', (req,res,next) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     next();
//   });
  
//   app.get('/dishes', (req,res,next) => {
//       res.end('Will send all the dishes to you!');
//   });
  
//   app.post('/dishes', (req, res, next) => {
//    res.end('Will add the dish: ' + req.body.name + ' with details: ' + req.body.description);
//   });
  
//   app.put('/dishes', (req, res, next) => {
//     res.statusCode = 403;
//     res.end('PUT operation not supported on /dishes');
//   });
   
//   app.delete('/dishes', (req, res, next) => {
//       res.end('Deleting all dishes');
//   });
  
//   app.get('/dishes/:dishId', (req,res,next) => {
//       res.end('Will send details of the dish: ' + req.params.dishId +' to you!');
//   });
  
//   app.post('/dishes/:dishId', (req, res, next) => {
//     res.statusCode = 403;
//     res.end('POST operation not supported on /dishes/'+ req.params.dishId);
//   });
  
//   app.put('/dishes/:dishId', (req, res, next) => {
//     res.write('Updating the dish: ' + req.params.dishId + '\n');
//     res.end('Will update the dish: ' + req.body.name + 
//           ' with details: ' + req.body.description);
//   });
  
//   app.delete('/dishes/:dishId', (req, res, next) => {
//       res.end('Deleting dish: ' + req.params.dishId);
//   });

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