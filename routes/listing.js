const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");



//Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});  // rendering index.ejs file and passing allListings data to it
}));

//New Route : to show the form to create a new listing
router.get("/new", isLoggedIn, (req, res) => {      // passing isLoggedIn middleware to check if the user is logged in before showing the form
    // console.log(req.user);
    res.render("./listings/new.ejs");
});

//Show Route : it will directed through clicking listing title in index.ejs file
router.get("/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author", }, }).populate("owner"); // with reviews we also get owner of reviews, populating the reviews array with the actual review documents, without populate we only get the object ids of the reviews
    if(!listing) {
        req.flash("error", "Listing you requested for, does not exist..!!"); // flash message for error
        return res.redirect("/listings");
    }
    res.render("./listings/show.ejs", {listing, currUser: req.user}); // passing the currently logged in user to the show.ejs file to check if the user is the owner of the listing or not
}));

//Create Route : to add a new listing to the database
router.post("/", isLoggedIn, validateListing, wrapAsync(async (req, res, next) => {  // async because we are doing database operation(inserting data) and now using wrapAsync to handle errors
    const newListing = new Listing(req.body.listing); 
    // console.log(req.user);
    newListing.owner = req.user._id; // setting the owner of the listing to the currently logged in user
    await newListing.save(); // saving the new listing to the database
    req.flash("success", "New Listing Created!"); // flash message for successful creation of listing)
    res.redirect("/listings"); 
})); 

//Edit Route : to show the form to edit a listing
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for, does not exist..!!"); // flash message for error
        return res.redirect("/listings");
    }
    // req.flash("success", "Listing Deleted!"); // flash message for successful deletion of listing
    res.render("./listings/edit.ejs", {listing});
}));

//Update Route : to update the edited listing in the database
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res) => { //validateListing before storing in database
    let {id} = req.params;
    let listing = await Listing.findById(id);
    // if(!listing.owner._id.equals(res.locals.currUser._id)) { // checking if the owner of the listing is the same as the currently logged in user
    //     req.flash("error", "You don't have permission to edit"); // flash message for error
    //     return res.redirect(`/listings/${id}`);
    // } -- moved to middleware.js file as isOwner function and used in app.js file

    await Listing.findByIdAndUpdate(id, {...req.body.listing}); // updating the listing with the new data from the form

    req.flash("success", "Listing Updated!"); // flash message for successful updation of listing
    res.redirect(`/listings/${id}`); // redirecting to the show route to see the updated listing
}));

//Delete Route : to delete a listing from the database
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id); // deleting the listing from the database
    res.redirect("/listings");
}));

module.exports = router;

// For any changes in the code go and check Airbnb folder on poorvajhv -> Projects -> Airbnb