const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Connected to MongoDB");
  }).catch(err => {
    console.log(err);
  });

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs"); // setting the view engine to ejs
app.set("views", path.join(__dirname, "views"));  // setting the views directory to the views folder
app.use(express.urlencoded({extended: true})); // to parse the incoming request body
app.use(methodOverride("_method")); // to use method-override
app.engine("ejs", ejsMate); // to use ejs-mate for layouts
app.use(express.static(path.join(__dirname, "/public"))); // to serve static files from the public directory


app.get("/", (req, res) => {
    res.send("Hii Poovi, you are on root page");
});

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body); // validating the request body against the listingSchema defined in schema.js file
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(","); // joining all the error messages into a single string 
        throw new ExpressError(400, error); // if there is an error in validation, throw an error with status code 400 and the error message
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body); // validating the request body against the reviewSchema defined in schema.js file
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(","); // joining all the error messages into a single string 
        throw new ExpressError(400, error); // if there is an error in validation, throw an error with status code 400 and the error message
    } else {
        next();
    }
}

//Index Route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});  // rendering index.ejs file and passing allListings data to it
}));

//New Route : to show the form to create a new listing
app.get("/listings/new", (req, res) => {
    res.render("./listings/new.ejs");
});

//Show Route : it will directed through clicking listing title in index.ejs file
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate('reviews'); // populating the reviews array with the actual review documents, without populate we only get the object ids of the reviews
    res.render("./listings/show.ejs", {listing});
}));

//Create Route : to add a new listing to the database
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {  // async because we are doing database operation(inserting data) and now using wrapAsync to handle errors
    // validateListing is a middleware function to validate the request body against the listingSchema defined in schema.js file
    // let {title, description, price, location, country} = req.body; --> to avoid this we use object type data access like below
    // try {
    //     const newListing = new Listing(req.body.listing); // listing is the key in new.ejs file which holds the object type data
    //     await newListing.save(); // saving the new listing to the database
    //     res.redirect("./listings"); // redirecting to the index route to see the new listing added
    // } catch(err) {
    //     next(err); // passing the error to the error handling middleware
    // }
    // if(!req.body.listing) { this if statement work is done by the below line using Joi schema validation
    //     throw new ExpressError(400, "Invalid Listing Data"); // if there is no listing data in the request body, throw an error
    // } 

    // const result = listingSchema.validate(req.body); // validating the request body against the listingSchema defined in schema.js file
    // if(result.error) {
    //     throw new ExpressError(400, result.error); // if there is an error in validation, throw an error with status code 400 and the error message
    // } this code moved to validateListing middleware function

    const newListing = new Listing(req.body.listing); 
    await newListing.save(); // saving the new listing to the database
    res.redirect("/listings"); 
})); 

//Edit Route : to show the form to edit a listing
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", {listing});
}));

//Update Route : to update the edited listing in the database
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => { //validateListing before storing in database
    // if(!req.body.listing) { replaced by validateListing middleware function
    //     throw new ExpressError(400, "Invalid Listing Data"); // if there is no listing data in the request body, throw an error
    // }
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing}); // updating the listing with the new data from the form
    res.redirect(`/listings/${id}`); // redirecting to the show route to see the updated listing
}));

//Delete Route : to delete a listing from the database
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id); // deleting the listing from the database
    res.redirect("/listings");
}));

//Reviews
//Post route 
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

//Delete route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
    let {id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}); // pulling(delete/update) out the reviewId from the reviews array in the listing document
    await Review.findByIdAndDelete(reviewId); // deleting the review document from the reviews collection

    res.redirect(`/listings/${id}`);
}));



// app.get('/testListing', async(req, res) => {    // route for testing the listing model
//     let sampleListing = new Listing({
//         title: 'My New vacation',
//         description: 'Near the beach',
//         price: 1200,
//         location: 'Mangalore',
//         country: 'India',
//     });

//     await sampleListing.save();
//     console.log('Listing saved');
//     res.send('successful listing');
// });

// app.all('*', (req, res, next) => {  // to handle all other routes that are not defined
//     console.log("Requested path:", req.path);
//     next(new ExpressError(404, "Page Not Found!"));
// });

app.use((err, req, res, next) => {      // error handling middleware(updated after ExpressError class creation)
    // const statusCode = err.statusCode || 404;
    // const message = err.message || "Something went wrong!";
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message }); // rendering the error.ejs file and passing the message to it
    // res.status(statusCode).send(message);
});

// app.use((err, req, res, next) => {  // error handling middleware
//     res.send("Something went wrong");
// });

app.listen(8000, () => {
    console.log('Server is listening on port 8000');
});