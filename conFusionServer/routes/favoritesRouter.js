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
    .then((favorite) => {
        console.log('Your Favorites: ', favorite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err)) //next shows that you're done here and will pass the req res params for /dishes endpoint to next method (.post)
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}) // get this exact doc for this user
    .then((favorite) => {
        if (favorite) { //if this user has favs already
            console.log('We found your favorite and will update: ', favorite);
            req.body.forEach((item) => {
                if (!favorite.dishes.includes(item._id)) {
                    favorite.dishes.push(item._id)
                    console.log('Added dish: ', item._id, " to your favs:", favorite);
                }})
            favorite.save()
            .then((favorite) => {
                console.log('We updated your favorite: ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);         
            }, (err) => next(err))
            .catch((err) => next(err));
        } else {  //if this user doesn't have favs, create
        console.log("You have no favs yet. Creating your new favs")
        Favorites.create({user: req.user._id})
        .then((favorite) => {
            console.log('Your Favorites created: ', favorite);
            req.body.forEach((item) => { //in each pair _id: id from body check dishes
            favorite.dishes.push(item._id) //add this dish to favs
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        },  (err) => next(err))
        .catch((err) => next(err));
    })}})
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndDelete({user: req.user._id}) // delete this exact doc for this user
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err)); 
});

favoritesRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites'+ req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}) // get this exact doc for this user
    .then((favorite) => {
        if (favorite) { //if this user has favs already
            console.log('We found your favorite and will update: ', favorite);
            if (!favorite.dishes.includes(req.params.dishId)) {
                favorite.dishes.push(req.params.dishId)
                console.log('Added dish: ', req.params.dishId, " to your favs:", favorite);
            }
            favorite.save()
            .then((favorite) => {
                console.log('We updated your favorite: ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);         
            }, (err) => next(err))
            .catch((err) => next(err));
        } else {  //if this user doesn't have favs, create
        console.log("You have no favs yet. Creating your new favs")
        Favorites.create({user: req.user._id})
        .then((favorite) => {
            favorite.dishes.push(req.params.dishId) //add this dish to favs
            console.log('Added dish: ', req.params.dishId, " to your favs:", favorite);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);                
        }, (err) => next(err))
        .catch((err) => next(err));
    }})
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites'+ req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}) 
    .then((favorite) => {
        let dishIndex = favorite.dishes.indexOf(req.user._id)
        favorite.dishes.splice(dishIndex, 1); // from the item index remove 1 element
        console.log('Deleted dish: ', req.params.dishId, " from your favs:", favorite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoritesRouter;
