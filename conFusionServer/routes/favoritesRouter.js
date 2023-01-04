const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorites');

const favoritesRouter = express.Router();

favoritesRouter.use(bodyParser.json());

favoritesRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); }) //for preflight req, the client sends http OPTIONS req message before sending the actual req
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .populate("user")
    .populate("dishes")
    .exec((err, favorites) => { // when you don't pass a callback, you can build a query and eventually execute it
        //.exec() returnes a promise
        if (err) return next(err);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    });
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}, (err, favorite)) // get this exact doc for this user
    if (err) return next(err);
    if (!favorite) { // if the user doesn't have favorites
        Favorites.create({user: req.user._id})
        .then((favorite) => {
            req.body.forEach((item) => {
                favorite.dishes.push(item._id)
            })
            favorite.save()
            .then((favorite) => {
                console.log('Favorites created: ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })
            .catch((err) => {
                return next(err);
            });
        })
        .catch((err) => {
            return next(err);
        });
    } else { // if the user has favorites
        req.body.forEach((item) => { //in each pair _id: id from the body check if this dish exists in favs
            if (!favorite.dishes.includes(item._id)) {  // if the favs don't include the current dish
                favorite.dishes.push(item._id)
                console.log('Added dish: ', item._id);
            } else { //  if the favs include the current dish
                res.statusCode = 403;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Dish '+ req.params.dishId + ' has been already added');
            }
        })
        favorite.save()
        .then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        })
        .catch((err) => {
            return next(err);
        });
    }
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndDelete({user: req.user._id}) // delete this exact doc for this user
    .then((favorite) => {
        console.log('Deleted favorites: ', favorite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err)); 
});

favoritesRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('GET operation not supported on /favorites'+ req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}, (err, favorite))// get this exact doc for this user
    if (err) return next(err);
    if (!favorite) { // if the user doesn't have favorites
        Favorites.create({user: req.user._id})
        .then((favorite) => {
            favorite.dishes.push(req.params.dishId)
            favorite.save()
            .then((favorite) => {
                console.log('Added dish: ', req.params.dishId);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);         
            })
            .catch((err) => {
                return next(err);
            });
        })
        .catch((err) => {
            return next(err);
        });
    } else { // if the user has favorites
        if (!favorite.dishes.includes(req.params.dishId)) { // check if the favs include the current dish
            favorite.dishes.push(req.params.dishId)
            favorite.save()
            .then((favorite) => {
                console.log('Added dish: ', req.params.dishId);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite); 
            })
            .catch((err) => {
                return next(err);
            });
        } else {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Dish '+ req.params.dishId + ' has been already added');
        }
    }
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites'+ req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}, (err, favorite))
    if (err) return next(err);
    let dishIndex = favorite.dishes.indexOf(req.params.dishId)
        if (dishIndex >= 0) { // if the favs include the current dish
            favorite.dishes.splice(dishIndex, 1); // from the dishIndex remove 1 element
            favorite.save()
            .then((favorite) => {
                console.log('Deleted dish: ', req.params.dishId);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            })           
            .catch((err) => {
                return next(err);
            });
        } else { // if the favs don't include the current dish
            res.statusCode = 403;
            res.setHeader('Content-Type', 'text/plain');
            res.end("Favorites don't have dish "+ req.params.dishId);
        }
});

module.exports = favoritesRouter;
