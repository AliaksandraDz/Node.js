const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const dboper = require('./operations');

const url = 'mongodb://localhost:27017/';
const dbname = 'conFusion';

MongoClient.connect(url, (err, client) => {

    assert.equal(err,null); //check if err is null

    console.log('Connected correctly to server');

    const db = client.db(dbname); //method db() - to use dbname "conFusion"
//     const collection = db.collection("dishes"); //access collection "dishes". if does not exist - create
//     collection.insertOne({"name": "Uthappizza", "description": "test"}, //inserts one document into collection
//     (err, result) => {
//         assert.equal(err,null);

//         console.log("After Insert:\n");
//         console.log(result.ops); // shows how many operations were done successfully; how many documents were inserted into database (1) and show them

//         collection.find({}).toArray((err, docs) => { //find every doc and toArray
//             assert.equal(err,null);
            
//             console.log("Found:\n");
//             console.log(docs);

//             db.dropCollection("dishes", (err, result) => { //delete collection
//                 assert.equal(err,null);

//                 client.close(); //close connection to the DB
//             });
//         });
//     });
    dboper.insertDocument(db, { name: "Vadonut", description: "Test"},
    "dishes", (result) => {
        console.log("Insert Document:\n", result.ops);

        dboper.findDocuments(db, "dishes", (docs) => {
            console.log("Found Documents:\n", docs);

            dboper.updateDocument(db, { name: "Vadonut" },
            { description: "Updated Test" }, "dishes",
            (result) => {
                console.log("Updated Document:\n", result.result);

                dboper.findDocuments(db, "dishes", (docs) => {
                    console.log("Found Updated Documents:\n", docs);
                        
                    db.dropCollection("dishes", (result) => {
                        console.log("Dropped Collection: ", result);

                        client.close();
                    });
                });
            });
        });
    });
});