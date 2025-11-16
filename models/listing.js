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
        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
}, { timestamps: true });

// Add indexes for better performance
listingSchema.index({ owner: 1 });
listingSchema.index({ location: 1 });
listingSchema.index({ country: 1 });
listingSchema.index({ geometry: '2dsphere' });

//Mongoose Middleware : to delete all the reviews associated with a listing when the listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {
    if(listing) {
        await Review.deleteMany({_id: {$in: listing.reviews}}); // deleting all the reviews associated with the listing, when it is being deleted
    }
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;