const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config()
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers')
const Campground = require('../models/campground')

//create the db connection (dbname = yelp-camp)
mongoose.connect(process.env.MONGO_URI,
    { useNewUrlParser: true})
    .then(()=> console.log('DB Connected!!'))
    .catch(err=> console.error(err))

const sample = array => array[Math.floor(Math.random()* array.length)];
const seedDB = async () => {
    await Campground.deleteMany({});
    //create seed logic
    for(let i = 0; i < 300; i++){
        const random1000 = Math.floor(Math.random()* 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author:'642606b6af62b7da0ceb4e54',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)}, ${sample(places)}`,
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Corporis cum voluptates accusamus dolorem fuga repellat, nobis illo? Ut sunt est voluptatibus vitae ex, fugiat magni in fuga ad aliquid! Ut!',
            price,
            geometry: {
              type: "Point",
              coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude
              ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dxarelvy7/image/upload/v1684966436/YelpCamp/pjonxq7qwdfpcvzyrjej.jpg',
                  filename: 'YelpCamp/pjonxq7qwdfpcvzyrjej',
                },
                {
                  url: 'https://res.cloudinary.com/dxarelvy7/image/upload/v1684966437/YelpCamp/ubdneno01jptdzkb3zj8.jpg',
                  filename: 'YelpCamp/ubdneno01jptdzkb3zj8',
                },
              ]
            })
            await camp.save();
    }
}

//close the
// seedDB(() => {
//     mongoose.connection.close();
// })

seedDB().then(() =>{
    mongoose.connection.close();
})