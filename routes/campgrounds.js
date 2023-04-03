const express = require('express');
const router = express.Router();
const { campgroundSchema } = require('../schemas.js')
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')

const validateCampground = (req, res, next) => {
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

router.get('/', async(req, res) =>{
    const campgrounds = await Campground.find({});
    //render campgrounds
    // console.log(campgrounds)
    res.render('campgrounds/index', { campgrounds})
});



//submit the new campground

router.post('/', validateCampground, catchAsync(async(req, res, next) =>{

    //handle server side missing data errors
    //if(!req.body.campground) throw new ExpressError('Invalid Campground data', 400);

    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campgrounds/${campground._id}`)
}));


router.get('/new', catchAsync(async(req, res) => {
    if(!req.isAuthenticated()) {
        req.flash('error', 'you must be signed in')
        res.redirect('/login')
    }
    res.render('campgrounds/new')
}));

//make new campground using the campground Schema

// router.get('/makecampground', catchAsync(async(req, res) => {
//     const campground = new Campground({title: 'My Backyard', description: 'Cheap camping' })
//     await campground.save();
//     res.send(camp);
// }));


router.get('/:id', catchAsync(async(req, res)=> {
    const campground = await Campground.findById(req.params.id).populate('reviews')
    if(!campground){
        req.flash('error', 'Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground})
}));


router.get('/:id/edit', catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit' , { campground })
}));

//put request for camoground update
router.put('/:id', catchAsync(async(req, res)=>{
    //take id, destructure
    const {id} = req.params;
    //use spread operator to spread the id object into req.body.campground
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    req.flash("success", "Successfully updated campground")
    res.redirect(`/campgrounds/${campground._id}`)
}));


router.delete('/:id', catchAsync(async(req, res) =>{
    //take id destructure
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id)
    req.flash("success", "Successfully deleted campground")
    res.redirect('/campgrounds');
}));

module.exports = router