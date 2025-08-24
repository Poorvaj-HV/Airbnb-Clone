const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true 
    },
    description: String,
    image: {
        filename: String,
        url: {
            type: String,
            default: "https://unsplash.com/photos/a-person-stands-on-rocks-under-a-sunset-sky-cdP8YP7hyFo",
            set: (v) => v === "" ? "https://unsplash.com/photos/a-person-stands-on-rocks-under-a-sunset-sky-cdP8YP7hyFo" : v,
        }
    },
    price: Number,
    location: String,
    country: String,
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;