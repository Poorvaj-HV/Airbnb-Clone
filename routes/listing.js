const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body); // validating the request body against the listingSchema defined in schema.js file
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(","); // joining all the error messages into a single string 
        throw new ExpressError(400, error); // if there is an error in validation, throw an error with status code 400 and the error message
    } else {
        next();
    }
}

//Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});  // rendering index.ejs file and passing allListings data to it
}));

//New Route : to show the form to create a new listing
router.get("/new", (req, res) => {
    res.render("./listings/new.ejs");
});

//Show Route : it will directed through clicking listing title in index.ejs file
router.get("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate('reviews'); // populating the reviews array with the actual review documents, without populate we only get the object ids of the reviews
    if(!listing) {
        req.flash("error", "Listing you requested for, does not exist..!!"); // flash message for error
        res.redirect("/listings");
    }
    res.render("./listings/show.ejs", {listing});
}));

//Create Route : to add a new listing to the database
router.post("/", validateListing, wrapAsync(async (req, res, next) => {  // async because we are doing database operation(inserting data) and now using wrapAsync to handle errors
    const newListing = new Listing(req.body.listing); 
    await newListing.save(); // saving the new listing to the database
    req.flash("success", "New Listing Created!"); // flash message for successful creation of listing)
    res.redirect("/listings"); 
})); 

//Edit Route : to show the form to edit a listing
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for, does not exist..!!"); // flash message for error
        return res.redirect("/listings");
    }
    req.flash("success", "Listing Deleted!"); // flash message for successful deletion of listing
    res.render("./listings/edit.ejs", {listing});
}));

//Update Route : to update the edited listing in the database
router.put("/:id", validateListing, wrapAsync(async (req, res) => { //validateListing before storing in database
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing}); // updating the listing with the new data from the form

    req.flash("success", "Listing Updated!"); // flash message for successful updation of listing
    res.redirect(`/listings/${id}`); // redirecting to the show route to see the updated listing
}));

//Delete Route : to delete a listing from the database
router.delete("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id); // deleting the listing from the database
    res.redirect("/listings");
}));

module.exports = router;

// For any changes in the code go and check Airbnb folder on poorvajhv -> Projects -> Airbnb