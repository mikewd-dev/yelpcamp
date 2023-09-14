const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage})
const catchAsync = require('../utils/catchAsync')

const Campground = require('../models/campground')

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));

router.get('/new', isLoggedIn, catchAsync(campgrounds.renderNewForm));

router.route('/:id')
    .get(catchAsync(campgrounds.showCampgrounds))
    .put(isLoggedIn, isAuthor, upload.array('image'), catchAsync(campgrounds.updateCampgrounds))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))




router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

//put request for camoground update



module.exports = router