
require('dotenv').config()

const express = require('express');
const path = require('path');
const methodOverride = require('method-override')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const Client = require('./models/client')
const mongoose = require('mongoose');
const session = require('express-session')
const MongoStore = require('connect-mongo');
const helmet = require('helmet');

//create the db connection (dbname = yelp-camp)
mongoose.connect(process.env.MONGO_URI,
    { useNewUrlParser: true})
    .then(()=> console.log('DB Connected!!'))
    .catch(err=> console.error(err))
const ejsMate = require('ejs-mate');
const mongoSanitize = require('express-mongo-sanitize');



const { campgroundSchema, reviewSchema } = require('./schemas.js')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground')
const Review = require('./models/review')
const User = require('./models/client')

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

app.use(mongoSanitize());

const store = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    touchAfter: 24 * 60 * 60,
    crypto:{
        secret: 'thisshouldbeabettersecret!',
    }
});

store.on("error", function(e) {
    console.log("Session Store Error", e)
});



const sessionConfig = {
    store,
    name: 'yelpcampsession',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() * 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

 const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://events.mapbox.com",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dxarelvy7/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dxarelvy7/"
];
const connectSrcUrls = [
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://events.mapbox.com/",
    "https://res.cloudinary.com/dxarelvy7/",
    "https://fonts.gstatic.com/"

];
const fontSrcUrls = [
    "https://res.cloudinary.com/dxarelvy7/",
    "https://fonts.gstatic.com/",
 ];

app.use(
    helmet({
        contentSecurityPolicy: {
            directives : {
                defaultSrc : [],
                connectSrc : [ "'self'", ...connectSrcUrls ],
                scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
                styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
                workerSrc  : [ "'self'", "blob:" ],
                objectSrc  : [],
                imgSrc     : [
                    "'self'",
                    "blob:",
                    "data:",
                    "https://res.cloudinary.com/dxarelvy7/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                    "https://images.unsplash.com/"
                ],
                fontSrc    : [ "'self'", ...fontSrcUrls ],
                mediaSrc   : [ "https://res.cloudinary.com/dxarelvy7/", ],
                childSrc   : [ "blob:" ]
            }
        },
        crossOriginEmbedderPolicy: false
    })
);


app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(Client.authenticate()));

passport.serializeUser(Client.serializeUser());
passport.deserializeUser(Client.deserializeUser())

app.use((req, res, next) => {
    // console.log(req.session)
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

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})



app.listen(3001, ()=>{
    console.log('Serving on port 3001')
});
