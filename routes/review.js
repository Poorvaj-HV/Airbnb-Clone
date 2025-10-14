const express = require('express');
const router = express.Router({ mergeParams: true }); // to access the params from the parent router(app.js file) like :id of listings, else it will be undefined and error will occur after submitting the review form
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

//Reviews
//Post route 
router.post("/", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id; // setting the author of the review to the currently logged in user

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Created!"); // flash message for successful creation of review
    res.redirect(`/listings/${listing._id}`);
}));

//Delete route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
    let {id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}); // pulling(delete/update) out the reviewId from the reviews array in the listing document
    await Review.findByIdAndDelete(reviewId); // deleting the review document from the reviews collection

    req.flash("success", "Review Deleted!"); // flash message for successful deletion of review
    res.redirect(`/listings/${id}`);
}));

module.exports = router;