const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn , isOwner,validateListing} = require("../middleware.js");
const listingController = require('../controllers/listings.js');
const multer = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

//index route

router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn,upload.single("listing[image]"), validateListing , wrapAsync(listingController.createListing));

router.patch("/like", isLoggedIn , wrapAsync(listingController.like) );
router.patch("/unlike", isLoggedIn , wrapAsync(listingController.unlike) );
//new route
router.get("/new",isLoggedIn, wrapAsync(listingController.renderNewForm));

router.get("/user", isLoggedIn , wrapAsync(listingController.user));

router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner,upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));


//edit route
router.get("/:id/edit",isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));


module.exports = router;
