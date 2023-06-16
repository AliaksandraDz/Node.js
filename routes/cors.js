const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['http://localhost:3000', 'https://localhost:3443', 'http://donavdey-Latitude-5480:3001', 'http://localhost:3001', 'http://localhost:3002']; //contains all the origins which the server will accept
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
    console.log(req.header('Origin'));
    if(whitelist.indexOf(req.header('Origin')) !== -1) { //if incoming req header contains Origin field, we'll check the whitelist
        corsOptions = { origin: true };
        // callback(null, true );  //the original origin from the incoming req is in the whitelist and is allowed to be accepted
    }
    else {
        corsOptions = { origin: true };
        // callback(new Error("Not allowed by CORS")); 
    }
    callback(null, corsOptions);
};

exports.cors = cors(); //allow origin with the wildcard star. 
exports.corsWithOptions = cors(corsOptionsDelegate);