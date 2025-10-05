const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

main()
  .then(() => {
    console.log('Connected to MongoDB');
  }).catch(err => {
    console.log(err);
  });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async() => {
    await Listing.deleteMany({}); // to clear the existing database and start fresh every time we run this function
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "68e16b98ce59c018ff40136b"}));  // adding a default owner to each listing object in the data array, replace with a valid user id from your User collection
    await Listing.insertMany(initData.data); // initData is an object holding data.js file's exports and data is the key in that object which is passed by data.js file and this data is inserted into the database using Listing collection schema
    console.log('data was inserted');
}

initDB(); // calling the function to initialize the database with sample data

