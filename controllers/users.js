const Campground = require('../models/campground')
const Client = require('../models/client');
const passport = require('passport');

module.exports.renderRegister = (req, res)=>{
    res.render('users/register')
}

module.exports.register = async(req, res, next) =>{
try{
    const{email, username, password} = req.body;
    const user = new Client({email, username});
    const registeredUser = await Client.register(user, password);
    req.login(registeredUser, err =>{
        if(err) return next(err)
        req.flash('success', 'Welcome to yelpcamp')
        res.redirect('/campgrounds')
    })
} catch(e){
    req.flash('error', e.message);
    res.redirect('register');
}

}

module.exports.renderLogin = (req, res)=>{
    res.render('users/login');
}

module.exports.login = (req, res)=>{
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res)=>{
    req.logout(function(err){
        if (err) {return next(err);}
        req.flash('success', 'Goodbye!')
    res.redirect('/campgrounds')
    })
}