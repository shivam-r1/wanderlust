if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user.js');

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require('./routes/user.js');
const bodyParser = require('body-parser');
const { log } = require("console");

const dbUrl = process.env.ATLASDB_URL;


main().then(() => {
    console.log("connected to db");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto :{
        secret : process.env.SECRET,
    },
    touchAfter : 24*3600,
});

store.on("error" , ()=>{
    console.log("Error in Mongo SESSION STORE",err);
});

const sessionOptions= {
    store ,
    secret : process.env.SECRET,
    resave :false ,
    saveUninitialized : true ,
    Cookie : {
        expires : Date.now() + 7*24*60*60*1000,
        maxAge :7*24*60*60*1000,
        httpOnly : true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req , res , next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser =req.user;
    next();
});

app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews" , reviewRouter);
app.use("/" , userRouter);

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "page not found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { statusCode, message });
});


// app.get("/testListing" , async (req, res)=>{
//     let sampleListing = new Listing({
//         title : "my new villa",
//         description : "by the beach",
//         price : 1200,
//         location: "calangute , goa",
//         country : "india",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});