var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var authenticate = require('./authenticate');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');

const mongoose = require('mongoose');

const Dishes = require('./models/dishes');
const Promotions = require('./models/promotions');
const Leaders = require('./models/leaders');

const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });

connect.then((db) => {
    console.log("Connected correctly to server");
}, (err) => { console.log(err); });

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.use(cookieParser('12345-67890-09876-54321'));
//Express will use the secret provided to cookie-parser to sign your cookie. 
//Cookie-parser will inject the secret into your request object. 
//Then, express will use it in order to sign the cookie. 
//If no secret is provided to cookie-parser (or another middleware), 
//then express will throw an error when trying to set a new signed cookie.

app.use(session({
  name: 'session-id', //The name of the session ID cookie to set in the response (and read from in the request)
  secret: '12345-67890-09876-54321', //It is a required option and is used for signing the session ID cookie.
  saveUninitialized: false, //If during the lifetime of the request the session object isn't modified then, 
  //at the end of the request and when saveUninitialized is false, the (still empty, because unmodified)
  // session object will not be stored in the session store.
  resave: false, //if true - tell the session store that a particular session is still active,
  // which is necessary because some stores will delete unused sessions after some time.
  store: new FileStore()
}));

app.use(passport.initialize()); //passport.initialize() is a middle-ware that initialises Passport. 
//basically passport.initialize() initialises the authentication module. 
app.use(passport.session()); // passport.session() acts as a middleware to alter the req object and change the 'user' value 
//that is currently the session id (from the client cookie) into the true deserialized user object.

app.use('/', indexRouter);
app.use('/users', usersRouter);

function auth (req, res, next) {
  console.log(req.user);

  if (!req.user) {
    var err = new Error('You are not authenticated!');
    err.status = 403;
    next(err);
  }
  else {
        next();
  }
}

app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/dishes',dishRouter);
app.use('/promotions',promoRouter);
app.use('/leaders',leaderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
