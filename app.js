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

const listingRoutes = require("./routes/listing.js");

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

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body); // validating the request body against the reviewSchema defined in schema.js file
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(","); // joining all the error messages into a single string 
        throw new ExpressError(400, error); // if there is an error in validation, throw an error with status code 400 and the error message
    } else {
        next();
    }
}

app.use("/listings", listingRoutes); // using the listing routes defined in routes/listing.js file

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