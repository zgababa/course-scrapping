const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://mongo-scrap:27017';

const dbName = 'course';
let db;

module.exports = {
  connectToServer() {
    return new Promise((resolve) => {
      MongoClient.connect(url, (err, client) => {
        assert.equal(null, err);
        console.log('Connected successfully to server');

        db = client.db(dbName);
        return resolve(db);
      });
    });
  },
  getDb() {
    if (!db) {
      return this.connectToServer();
    }
    return db;
  }
};
