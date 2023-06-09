var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    username: {
      type: String,
      default: ''
    },
    firstname: {
      type: String,
      default: ''
    },
    lastname: {
      type: String,
      default: ''
    },
    admin:   {
      type: Boolean,
      default: false
    }
});

User.plugin(passportLocalMongoose); //for using Plugin Passport-Local Mongoose

module.exports = mongoose.model('User', User);