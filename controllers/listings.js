const Listing = require("../models/listing.js");
const opencage = require('opencage-api-client');
const User = require("../models/user");

module.exports.index = async (req, res) => {
    const genreEnum = Listing.schema.path('genre').enumValues;

    const search = (req.query.search) || ""; 
    let genre = req.query.genre || "All";
    let active = req.query.genre ;


    genre === "All"
        ?(genre = [...genreEnum])
        :(genre = req.query.genre.split(","));    

    const allListings = await Listing.find({$or : [{genre : {$regex : search , $options:"i"}} , {title : {$regex : search , $options:"i"}} , {location : {$regex : search , $options:"i"}}]}).where("genre").in([...genre]);

    res.render("listings/index.ejs", { allListings , active  });
}

module.exports.like = async(req ,res)=>{
    const updateLikeListing = await Listing.findByIdAndUpdate(req.body.listingId , { $push : {like : req.user._id } } , {new : true});
    res.send(updateLikeListing);
}

module.exports.unlike = async(req ,res)=>{
    const updateLikeListing = await Listing.findByIdAndUpdate(req.body.listingId , { $pull : {like : req.user._id } } , {new : true});
    res.send(updateLikeListing);
}

module.exports.renderNewForm = async (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
            .populate({
                path : "reviews",
                populate:{
                    path:"author",
                },
            })
            .populate('owner');
    if(!listing){
        req.flash("error" , "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}

module.exports.createListing = async (req, res) => {
    const response = await opencage.geocode({ q: req.body.listing.location , key: process.env.MAP_GEOCODING });
    const { geometry, formatted } = response.results[0];
    // console.log(`Place Name: ${formatted}`);
    let url = req.file.path ;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id ;
    newListing.image = {url , filename};
    newListing.geometry= ([geometry.lng , geometry.lat ] ) ;
    await newListing.save();
    req.flash("success" , "New Listing Created!");
    res.redirect("/listings");
}

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error" , "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    let originalImage = listing.image.url;
    originalImage = originalImage.replace("/upload" , "/upload/w_250");
    res.render("listings/edit.ejs", { listing , originalImage});
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    const response = await opencage.geocode({ q: req.body.listing.location , key: process.env.MAP_GEOCODING });
    const { geometry} = response.results[0];
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing , geometry : [geometry.lng , geometry.lat ] });
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url , filename};
        await listing.save();
    }
    req.flash("success" , "Listing Updated!");
    res.redirect(`/listings/${id}`);
    console.log({ ...req.body.listing });
}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    req.flash("success" , "Listing Deleted!");
    res.redirect("/listings");
    console.log(deleteListing);
}

module.exports.user = async (req ,res)=>{
    const userId = req.user._id;
    const user = await User.findById(userId);
    const userListing = await Listing.find({owner : userId})
    res.render("users/user.ejs",{user , userListing});
}



// module.exports.search = async(req , res)=>{
//     const search = (req.query.query) || ""; 

//     const allListings = await Listing.find({title : {$regex : search , $options:"i"}});
//     res.render("./listings/index.ejs", { allListings });
// }