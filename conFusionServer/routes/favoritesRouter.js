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
        if (favorites==null) {
            res.json({dishes:[]});
        }
        else {
            res.json(favorites);
        }
    });
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}, (err, favorite) => {    
        if (err) return next(err);
        if (!favorite) { // if the user doesn't have favorites
            Favorites.create({user: req.user._id})
            .then((favorite) => {
                req.body.forEach((item) => {
                    favorite.dishes.push(item._id)
                })
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
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
                Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes')
                .then((favorite) => {
                    console.log('Updated Favorites: ', favorite);
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
        }
    })
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndDelete({user: req.user._id}, (err, resp) => {
        if (err) return next(err)
        console.log('Deleted favorites');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    })
});

favoritesRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) { // the user doesn't have favorites
            console.log("the user doesn't have favorites");
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else { // the user has favorites
            if (favorites.dishes.includes(req.params.dishId)) { // favorites include this dish
                console.log("favorites include this dish");
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
            else { // favorites don't include this dish
                console.log("favorites don't include this dish");
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}, (err, favorite) => {
        if (err) return next(err);
        if (!favorite) { // if the user doesn't have favorites
            Favorites.create({user: req.user._id})
            .then((favorite) => {
                favorite.dishes.push(req.params.dishId)
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
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
            })
            .catch((err) => {
                return next(err);
            });
        } else { // if the user has favorites
            if (!favorite.dishes.includes(req.params.dishId)) { // check if the favs include the current dish
                favorite.dishes.push(req.params.dishId)
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
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
            } else {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Dish '+ req.params.dishId + ' has been already added');
            }
        }
    })
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites'+ req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id}, (err, favorite) => {
        if (err) return next(err);
        let dishIndex = favorite.dishes.indexOf(req.params.dishId)
            if (dishIndex >= 0) { // if the favs include the current dish
                favorite.dishes.splice(dishIndex, 1); // from the dishIndex remove 1 element
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        console.log('Deleted dish: ', req.params.dishId);
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
            } else { // if the favs don't include the current dish
                res.statusCode = 403;
                res.setHeader('Content-Type', 'text/plain');
                res.end("Favorites don't have dish "+ req.params.dishId);
            }
    })
});

module.exports = favoritesRouter;
