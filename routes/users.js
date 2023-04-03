const express = require('express');
const router = express.Router();
const flash = require('connect-flash')
const catchAsync = require('../utils/catchAsync')
const Client = require('../models/client');
const passport = require('passport');

router.get('/register', (req, res)=>{
    res.render('users/register')
})


router.post('/register', catchAsync(async(req, res) =>{
try{
    const{email, username, password} = req.body;
    const user = new Client({email, username});
    const registeredUser = await Client.register(user, password);
    console.log(registeredUser)
    req.flash('success', 'Welcome to yelpcamp')
    res.redirect('/campgrounds')
} catch(e){
    req.flash('error', e.message);
    res.redirect('register');
}

}));

router.get('/login', (req, res)=>{
    res.render('users/login');
})

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}),(req, res)=>{
    req.flash('success', 'welcome back!');
    res.redirect('campgrounds')
})

module.exports = router;