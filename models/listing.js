const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review.js');

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
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

//Mongoose Middleware : to delete all the reviews associated with a listing when the listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {
    if(listing) {
        await Review.deleteMany({_id: {$in: listing.reviews}}); // deleting all the reviews associated with the listing, when it is being deleted
    }
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;