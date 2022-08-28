const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017/';
const dbname = 'conFusion';

MongoClient.connect(url, (err, client) => {

    assert.equal(err,null); //check if err is null

    console.log('Connected correctly to server');

    const db = client.db(dbname); //method db() - to use dbname "conFusion"
    const collection = db.collection("dishes"); //access collection "dishes". if does not exist - create
    collection.insertOne({"name": "Uthappizza", "description": "test"}, //inserts one document into collection
    (err, result) => {
        assert.equal(err,null);

        console.log("After Insert:\n");
        console.log(result.ops); // shows how many operations were done successfully; how many documents were inserted into database (1)

        collection.find({}).toArray((err, docs) => { //find every doc and toArray
            assert.equal(err,null);
            
            console.log("Found:\n");
            console.log(docs);

            db.dropCollection("dishes", (err, result) => { //delete collection
                assert.equal(err,null);

                client.close(); //close connection to the DB
            });
        });
    });

});