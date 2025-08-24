const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');

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

app.get('/', (req, res) => {
    res.send('Hii Poovi, you are on root page');
});

app.get('/testListing', async(req, res) => {    // route for testing the listing model
    let sampleListing = new Listing({
        title: 'My New vacation',
        description: 'Near the beach',
        price: 1200,
        location: 'Mangalore',
        country: 'India',
    });

    await sampleListing.save();
    console.log('Listing saved');
    res.send('successful listing');
});


app.listen(8000, () => {
    console.log('Server is listening on port 8000');
});