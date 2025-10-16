const Listing = require('../models/listing.js');

// Get all listings

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});  // rendering index.ejs file and passing allListings data to it
};

module.exports.renderNewForm = (req, res) => {      // passing isLoggedIn middleware to check if the user is logged in before showing the form
    res.render("./listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author", }, }).populate("owner"); // with reviews we also get owner of reviews, populating the reviews array with the actual review documents, without populate we only get the object ids of the reviews
    if(!listing) {
        req.flash("error", "Listing you requested for, does not exist..!!"); // flash message for error
        return res.redirect("/listings");
    }
    res.render("./listings/show.ejs", {listing, currUser: req.user}); // passing the currently logged in user to the show.ejs file to check if the user is the owner of the listing or not
};

module.exports.createListing = async (req, res, next) => {  // async because we are doing database operation(inserting data) and now using wrapAsync to handle errors
    const newListing = new Listing(req.body.listing); 
    // console.log(req.user);
    newListing.owner = req.user._id; // setting the owner of the listing to the currently logged in user
    await newListing.save(); // saving the new listing to the database
    req.flash("success", "New Listing Created!"); // flash message for successful creation of listing)
    res.redirect("/listings"); 
};

module.exports.editListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for, does not exist..!!"); // flash message for error
        return res.redirect("/listings");
    }
    // req.flash("success", "Listing Deleted!"); // flash message for successful deletion of listing
    res.render("./listings/edit.ejs", {listing});
};

module.exports.updateListing = async (req, res) => { //validateListing before storing in database
    let {id} = req.params;
    let listing = await Listing.findById(id);
    // if(!listing.owner._id.equals(res.locals.currUser._id)) { // checking if the owner of the listing is the same as the currently logged in user
    //     req.flash("error", "You don't have permission to edit"); // flash message for error
    //     return res.redirect(`/listings/${id}`);
    // } -- moved to middleware.js file as isOwner function and used in app.js file

    await Listing.findByIdAndUpdate(id, {...req.body.listing}); // updating the listing with the new data from the form

    req.flash("success", "Listing Updated!"); // flash message for successful updation of listing
    res.redirect(`/listings/${id}`); // redirecting to the show route to see the updated listing
};

module.exports.destroyListing = async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id); // deleting the listing from the database
    res.redirect("/listings");
};