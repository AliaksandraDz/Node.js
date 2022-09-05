const mongoose = require('mongoose');

const Dishes = require('./models/dishes');

const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });

connect.then((db) => {

    console.log('Connected correctly to server');

    Dishes.create({
        name: 'Uthappizza',
        description: 'test'
    })
    // newDish.save() //The save() method returns a promise. If save() succeeds, the promise resolves to the document that was saved.
        .then((dish) => {
            console.log(dish);

            return Dishes.find({}).exec(); //Queries do return a thenable, but if you need a real Promise you should use the exec method. 
        })
        .then((dishes) => {
            console.log(dishes);

            return Dishes.deleteMany({});
        })
        .then(() => {
            return mongoose.connection.close();
        })
        .catch((err) => {
            console.log(err);
        });

});