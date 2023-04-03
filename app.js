const express = require('express');
const path = require('path');
const methodOverride = require('method-override')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const Client = require('./models/client')
const mongoose = require('mongoose');
const session = require('express-session')
require('dotenv').config()
//create the db connection (dbname = yelp-camp)
mongoose.connect(process.env.MONGO_URI,
    { useNewUrlParser: true})
    .then(()=> console.log('DB Connected!!'))
    .catch(err=> console.error(err))
const ejsMate = require('ejs-mate');

const { campgroundSchema, reviewSchema } = require('./schemas.js')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground')
const Review = require('./models/review')

const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')

// mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')

//set up db
const db = mongoose.connection;
//check for connection error and display on console
// db.on("error", console.error.bind(console, "connection error"));
// //otherwise successful connection
// db.once("open", () =>{
//     console.log("Database connected")
// })

const app = express();

//we need to tell express to parse the body
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitaled: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() * 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next)=>{
    res.locals.messages = req.flash("success")
    res.locals.error = req.flash("error")
    next();
})


app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(Client.authenticate()));

passport.serializeUser(Client.serializeUser());
passport.deserializeUser(Client.deserializeUser())

app.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser', async(req, res) =>{
    const user = new Client({email: 'colttt@gmail.com', username: 'colttt'})
    const newUser = await Client.register(user, 'chicken')
    res.send(newUser);
})

app.engine('ejs', ejsMate)
//set the view engine 'ejs'
app.set('view engine', 'ejs');
//set the path to where ejs files are (views)
app.set('views', path.join(__dirname, 'views'))


app.use((err, req, res, next)=> {
    const { statusCode = 500, message = 'Something went wrong'} = err;
    //display error message and stack
    if(!err.message) err.message = 'Oh no, something went wrong!'
    //err should be passed through to the error template
    res.status(statusCode).render('error', { err });
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render("home");
});





app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})



app.listen(3001, ()=>{
    console.log('Serving on port 3001')
});
