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

//set up db
// const db = mongoose.connection;
//check for connection error and display on console
// db.on("error", console.error.bind(console, "connection error"));
//otherwise successful connection
// db.once("open", () =>{
//     console.log("Database connected")
// })

//pick random element from the array

const sample = array => array[Math.floor(Math.random()* array.length)];
const seedDB = async () => {
    await Campground.deleteMany({});
    //create seed logic
    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random()* 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)}, ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/10489597',
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Corporis cum voluptates accusamus dolorem fuga repellat, nobis illo? Ut sunt est voluptatibus vitae ex, fugiat magni in fuga ad aliquid! Ut!',
            price
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