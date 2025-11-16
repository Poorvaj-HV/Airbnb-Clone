const Listing = require('../models/listing.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');      // starting the geocoding service from mapbox sdk
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });    // initializing the geocoding client with the access token from environment variable

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

module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();

      let url = req.file.path;
      let filename = req.file.filename;
      const newListing = new Listing(req.body.listing);
      newListing.owner = req.user._id;
      newListing.image = { url, filename }; // storing the image url and filename in the listing document

      newListing.geometry = response.body.features[0].geometry; // storing the geometry of the location in the listing document

      let savedListing = await newListing.save();
      console.log(savedListing);
      req.flash("success", "New Listing Created!");
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

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250"); // resizing the image using cloudinary url manipulation
    res.render("./listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing = async (req, res) => { //validateListing before storing in database
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing}); // updating the listing with the new data from the form;
    // if(!listing.owner._id.equals(res.locals.currUser._id)) { // checking if the owner of the listing is the same as the currently logged in user
    //     req.flash("error", "You don't have permission to edit"); // flash message for error
    //     return res.redirect(`/listings/${id}`);
    // } -- moved to middleware.js file as isOwner function and used in app.js file

    if( typeof req.file !== "undefined" ) {    // checking if a new image is uploaded, if yes then update the image else keep the old image
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename }; // updating the image of the listing
        await listing.save(); // saving the updated listing to the database
    }

    req.flash("success", "Listing Updated!"); // flash message for successful updation of listing
    res.redirect(`/listings/${id}`); // redirecting to the show route to see the updated listing
};

module.exports.destroyListing = async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id); // deleting the listing from the database
    res.redirect("/listings");
};