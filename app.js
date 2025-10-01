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
const reviewRoutes = require("./routes/review.js");

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

app.use("/listings", listingRoutes); // using the listing routes defined in routes/listing.js file
app.use("/listings/:id/reviews", reviewRoutes); // using the review routes defined in routes/review.js file)

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