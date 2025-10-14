const { model } = require("mongoose");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl; // to store the url the user is trying to access before login, so that we can redirect them back to that url after login
        req.flash("error", "You must be signed in first!"); // flash message for error
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)) { // checking if the owner of the listing is the same as the currently logged in user
        req.flash("error", "You are not the owner of this listing"); // flash message for error
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body); // validating the request body against the listingSchema defined in schema.js file
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(","); // joining all the error messages into a single string 
        throw new ExpressError(400, error); // if there is an error in validation, throw an error with status code 400 and the error message
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body); // validating the request body against the reviewSchema defined in schema.js file
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(","); // joining all the error messages into a single string 
        throw new ExpressError(400, error); // if there is an error in validation, throw an error with status code 400 and the error message
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)) { // checking if the owner of the listing is the same as the currently logged in user
        req.flash("error", "You are not the author of this review"); // flash message for error
        return res.redirect(`/listings/${id}`);
    }
    next();
};