const MongoClient = require('mongodb').MongoClient;
// const assert = require('assert');
const dboper = require('./operations');

const url = 'mongodb://localhost:27017/';
const dbname = 'conFusion';

MongoClient.connect(url).then((client) => {

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
    "dishes")
    .then((result) => {
        console.log("Insert Document:\n", result.ops);

        return dboper.findDocuments(db, "dishes");
    })
    .then((docs) => {
        console.log("Found Documents:\n", docs);

        return dboper.updateDocument(db, { name: "Vadonut" },
                { description: "Updated Test" }, "dishes");

    })
    .then((result) => {
        console.log("Updated Document:\n", result.result);

        return dboper.findDocuments(db, "dishes");
    })
    .then((docs) => {
        console.log("Found Updated Documents:\n", docs);
                        
        return db.dropCollection("dishes");
    })
    .then((result) => {
        console.log("Dropped Collection: ", result);

        return client.close();
    })
    .catch((err) => console.log(err));

})
.catch((err) => console.log(err));