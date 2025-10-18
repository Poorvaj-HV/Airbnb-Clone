if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRoutes = require("./routes/listing.js");
const reviewRoutes = require("./routes/review.js");
const userRoutes = require("./routes/user.js");

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

const sessionOptions = {   // session configuration
    secret : "mysupersecretcode",
    resave : false,
    saveUninitialized : true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // cookie expires in 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000, // cookie max age is 7 days
        httpOnly: true, // for security purposes - to prevent from "cross-scripting attacks" // cookie is not accessible via client-side scripts 
    }
};

app.get("/", (req, res) => {
    res.send("Hii Poovi, you are on root page");
});

app.use(session(sessionOptions)); // using the session middleware
app.use(flash()); // using the flash middleware

app.use(passport.initialize()); // initializing passport
app.use(passport.session()); // using passport session
passport.use(new localStrategy(User.authenticate())); // using the local strategy for authentication, User.authenticate() is a method provided by passport-local-mongoose to authenticate users

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); // these methods are used to serialize and deserialize the user, when we login, passport will save some data about the user in the session (serialize) and when we make a request, passport will get the data from the session and use it to get the user details (deserialize)

app.use((req, res, next) => {
    res.locals.success = req.flash("success"); // to access success flash message in all templates
    res.locals.error = req.flash("error"); // to access error flash message in all templates
    res.locals.currUser = req.user; // to access the currently logged in user in all templates, req.user is provided by passport and contains the authenticated user
    next();
});

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "student"     // username is not defined in userSchema but it will be added by passport-local-mongoose plugin automatically
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld"); // register() is automatically checks if user is registered on DBs, instead of manually checking this using if-else by me, registering the user with the password, this method is provided by passport-local-mongoose plugin, it will hash and salt the password and save the user to the database.
//     res.send(registeredUser);
// });

app.use("/listings", listingRoutes); // using the listing routes defined in routes/listing.js file
app.use("/listings/:id/review", reviewRoutes); // using the review routes defined in routes/review.js file)
app.use("/", userRoutes); // using the user routes defined in routes/user.js file

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