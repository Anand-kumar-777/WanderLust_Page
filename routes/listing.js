const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js")
const multer = require('multer');
const {storage} = require("../cloudConfig.js")
const upload = multer({storage})

//Using the Router.router()//Index Route and Create both

router
 .route("/")
 .get(wrapAsync(listingController.index))
 .post(isLoggedIn,upload.single('listing[image]'),validateListing,
  wrapAsync(listingController.createListing)
);


// New Route - Form to Create New Listing
router.get('/new', isLoggedIn, listingController.renderNewForm);



//Update Route, Show Route and Delete Route
router
.route('/:id')
.get(
  isLoggedIn,
  wrapAsync(listingController.showListing))
 .put(isLoggedIn, isOwner, upload.single('listing[image]'),validateListing, listingController.updateListing)
 .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing) );


//Edit Route
router.get('/:id/edit',isLoggedIn, isOwner, listingController.renderEditForm);


module.exports = router;