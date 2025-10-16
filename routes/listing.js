const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");

//Index Route
router.get("/", wrapAsync(listingController.index));  // when this route is hit, it will call the index function from controllers/listings.js file

//New Route : to show the form to create a new listing
router.get("/new", isLoggedIn, listingController.renderNewForm); // passing isLoggedIn middleware to check if the user is logged in before showing the form

//Show Route : it will directed through clicking listing title in index.ejs file
router.get("/:id", wrapAsync(listingController.showListing)); // when this route is hit, it will call the showListing function from controllers/listings.js file

//Create Route : to add a new listing to the database
router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing)); // passing isLoggedIn middleware to check if the user is logged in before creating a new listing, validateListing to validate the data before storing in database

//Edit Route : to show the form to edit a listing
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing)); // passing isLoggedIn middleware to check if the user is logged in before showing the form, isOwner middleware to check if the user is the owner of the listing before allowing them to edit

//Update Route : to update the edited listing in the database
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing)); // passing isLoggedIn middleware to check if the user is logged in before updating the listing, isOwner middleware to check if the user is the owner of the listing before allowing them to update, validateListing to validate the data before storing in database

//Delete Route : to delete a listing from the database
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing)); // passing isLoggedIn middleware to check if the user is logged in before deleting the listing, isOwner middleware to check if the user is the owner of the listing before allowing them to delete

module.exports = router;

// For any changes in the code go and check Airbnb folder on poorvajhv -> Projects -> Airbnb