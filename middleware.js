const { request } = require("express")
const { campgroundSchema, reviewSchema} = require('./schemas.js')
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground');
const Review = require('./models/review')

module.exports.isLoggedIn = (req, res, next) => {
  const { id } = req.params;
  if (!req.isAuthenticated()) {
    req.session.returnTo = (req.query._method === 'DELETE' ? `/campgrounds/${id}` : req.originalUrl);
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if(error){
        //map over error.details and turn into a string
        const msg  = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400)
        //result.error.details is an array
    } else {
        next();
    }
}

module.exports.isAuthor = async(req, res, next) =>{
    const { id } = req.params
     const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user.id)) {
        req.flash("error", "You are not authorised to do that!");
        return res.redirect(`/campgrounds/${campground._id}`)
    }
    next()
}

module.exports.isReviewAuthor = async(req, res, next) =>{
    const { id, reviewId } = req.params;
     const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)) {
        req.flash("error", "You are not authorised to do that!");
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(e => el.message).join(', ')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}


