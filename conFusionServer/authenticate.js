var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy; //A Passport strategy for authenticating with a JSON Web Token.
var ExtractJwt = require('passport-jwt').ExtractJwt; //extractor factory function
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

var config = require('./config.js');

//With the strategy configured, it is then registered by calling .use():
passport.use(new LocalStrategy(User.authenticate()));

//If authentication succeeds, a session will be established and maintained via a cookie set in the user’s browser.
// However, if a user logs in and refreshes the page, the user data won’t persist across HTTP requests.
//We can fix this by serializing and deserializing users.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//Serializing a user determines which data of the user object should be stored in the session, usually the user id.
//The serializeUser() function sets an id as the cookie in the user’s browser,
// and the deserializeUser() function uses the id to look up the user in the database and retrieve the user object with data. 

exports.getToken = function(user) { //create token (kinda schema?), user - json obj
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600});
};

var opts = {}; // options for our jwt strategy to control how the token is extracted from the request or verified.
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();//creates a new extractor that looks for the JWT in the authorization header with the scheme 'bearer'
opts.secretOrKey = config.secretKey; //supply the secret key for this strategy

//export passport strategy and config it:
//new JwtStrategy(options, verify)
//verify is a function with the parameters: verify(jwt_payload, done)
//jwt_payload is an object literal containing the decoded JWT payload (returnes a token)
//done is a passport error first callback accepting arguments: done(error, user, info)
//through done parameter we pass back the info to pasport which it will use to load info to the request message
exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

//func to verify a new user authenticate(strategy, options?)
//don't create sessions because we use token-based authentication
exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = function(req, res, next) {
    if (!req.user.admin) {
        var err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        next(err);
    }
    else {
        next();
    }
};