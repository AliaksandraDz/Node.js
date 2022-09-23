var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');

passport.use(new LocalStrategy(User.authenticate()));

//If authentication succeeds, a session will be established and maintained via a cookie set in the user’s browser.
// However, if a user logs in and refreshes the page, the user data won’t persist across HTTP requests.
//We can fix this by serializing and deserializing users.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//Serializing a user determines which data of the user object should be stored in the session, usually the user id.
//The serializeUser() function sets an id as the cookie in the user’s browser,
// and the deserializeUser() function uses the id to look up the user in the database and retrieve the user object with data. 