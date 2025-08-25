const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');

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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"));  // setting the views directory to the views folder
app.use(express.urlencoded({extended: true})); // to parse the incoming request body

app.get('/', (req, res) => {
    res.send('Hii Poovi, you are on root page');
});

//Index Route
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});  // rendering index.ejs file and passing allListings data to it
});

//Show Route : it will directed through clicking listing title in index.ejs file
app.get("/listings/:id", async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/show.ejs", {listing});
});

// app.get('/testListing', async(req, res) => {    // route for testing the listing model
//     let sampleListing = new Listing({
//         title: 'My New vacation',
//         description: 'Near the beach',
//         price: 1200,
//         location: 'Mangalore',
//         country: 'India',
//     });

//     await sampleListing.save();
//     console.log('Listing saved');
//     res.send('successful listing');
// });


app.listen(8000, () => {
    console.log('Server is listening on port 8000');
});