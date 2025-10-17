const express = require('express');
const router = express.Router({ mergeParams: true }); // to access the params from the parent router(app.js file) like :id of listings, else it will be undefined and error will occur after submitting the review form
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");


const reviewController = require("../controllers/reviews.js");

//Reviews
//Post route 
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));  // using the createReview function from controllers/reviews.js

//Delete route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview)); // using the destroyReview function from controllers/reviews.js));

module.exports = router;