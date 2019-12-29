'use strict';




// get all environment variable you need
require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);

// initialize a server
const server = express();
server.use(cors()); // give access


const PORT = process.env.PORT ;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const DARKSKY_API_KEY = process.env.DARKSKY_API_KEY;
const EVENTFUL_API_KEY = process.env.EVENTFUL_API_KEY;
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
// Make the app listening
server.listen(PORT, () => console.log('hello Listening at port 3000'));



server.get('/', (request, response) => {
  response.status(200).send('Lets Rock !!');
});



// first step just like event listener
server.get('/location', locationHandler);

// cons function
function Location(city, data) {
  // console.log('constructor');
  // console.log(data);
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
  this.search_query = city;
}


//where the magic happend...
function locationHandler(request, response) {
  // Read the city from the user (request) and respond
  // console.log('handler');
  let city = request.query['city'];

  getLocationData(city)
    .then((data) => {
      response.status(200).send(data);
    });
}


function getLocationData(city) {

  let sql = `SELECT * FROM information WHERE city = $1`;
  let values = [city];
  // console.log('loca data');
  return client.query(sql, values)
    .then(results => {
      if (results.rowCount) {
        return results.rows[0];
      } else {
        const url = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json&limit=1`;
        // console.log('new f1 works');

        return superagent.get(url)

          .then(data => dataBaseLocation(city, data.body));
      }
    });
}


// //////
function dataBaseLocation(city, data) {
  // console.log('database location works');
  // console.log(data);

  const location = new Location(city ,data[0]);
  let SQL = `
    INSERT INTO information (city, latitude, longitude) 
    VALUES ($1, $2, $3) 
    RETURNING *
  `;

  let values = [city, location.latitude, location.longitude];
  return client.query(SQL, values)
    .then(results => results.rows[0]);
}



/////////////////////////////


// first step , just to make our code cleaner
// first step , just to make our code cleaner
server.get('/weather', weatherHandler);

// the costructor function
function Weather(day) {
  this.time = new Date(day.time * 1000).toDateString();
  this.forecast = day.summary;
}

function weatherHandler(request, response) {
  let lat = request.query['latitude'];
  let lng = request.query['longitude'];
  getWeatherData(lat, lng)
    .then((data) => {
      response.status(200).send(data);
    });

}

function getWeatherData(lat, lng) {
  const url = `https://api.darksky.net/forecast/${DARKSKY_API_KEY}/${lat},${lng}`;
  return superagent.get(url)
    .then((weatherData) => {
      //   console.log(weatherData.body.daily.data);
      let weather = weatherData.body.daily.data.map((day) => new Weather(day));
      return weather;
    });
}

/////////////////////////// test
/////////////////////////// test

server.get('/events', eventHandler);

function Event(day) {
  this.link = day.url;
  this.name = day.title;
  this.eventDate = day.start_time;
  this.summary = day.description;
}

function eventHandler(request, response) {
  let lat = request.query['latitude'];
  let lng = request.query['longitude'];
  getEventData(lat, lng)
    .then((data) => {
      response.status(200).send(data);
    });

}

function getEventData(lat, lng) {
  const url = `http://api.eventful.com/json/events/search?app_key=${EVENTFUL_API_KEY}&where=${lat},${lng}`;
  // console.log(url);
  return superagent.get(url)
    .then((eventData) => {
      let dataBase = JSON.parse(eventData.text);
      //   console.log(dataBase.events.event[0].description);
      let events = dataBase.events.event.map((day) => new Event(day));
      return events;
    });
}


///////////////////////////
/////////////////////////////////
///////////////// Movies ////////////////
server.get('/movies', movieHandler);

function Movie(movie) {
  this.title = movie.title;
  this.overview = movie.overview;
  this.average_votes = movie.vote_average;
  this.total_votes = movie.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
  this.popularity = movie.popularity;
  this.released_on = movie.release_date;
}


function movieHandler(request, response) {
  // let city = request.query.search_query;
  let city = request.query['city'];
  // console.log(city);
  // let lat = request.query['latitude'];
  // let lng = request.query['longitude'];
  getMoviesData(city)
    .then((data) => {
      response.status(200).send(data);
    });
}

function getMoviesData(city) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${MOVIE_API_KEY}&query=${city}`;
  return superagent.get(url)
    .then((movieData) => {
      let mov= movieData.body.results.map( movie => new Movie(movie));
      return mov;
    })
}
///////////////// Movies ////////////////
//////////////////////////////
/////////////////////



///////////////// Yelp ////////////////
//////////////////////////////
/////////////////////

server.get('/yelp' , yelpHandler) ;

function yelpHandler (request, response) {
  let lat = request.query['latitude'] ;
  let lng = request.query['longitude'] ;

  getYelpData(lat, lng)
    .then((data) => {
      response.status(200).send(data);
    });
}


function getYelpData(lat, lng){
  const url = `https://api.yelp.com/v3/businesses/search?term=restaurant&latitude=${lat}&longitude=${lng}` ;
  console.log(url)
  console.log('get data boooy')
  return superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then((yelpdata) => {
      console.log(yelpdata.body.businesses);

      let yelps = yelpdata.body.businesses.map((business) => {
       return new Yelp(business) ;
      })
      return yelps ;
    })
}


function Yelp (business) {
  this.name = business.name ;
  this.image_url = business.image_url ;
  this.price = business.price ;
  this.rating = business.rating ;
  this.url = business.url ;
}
///////////////// yelp ////////////////
//////////////////////////////
/////////////////////






server.use('*', (request, response) => {
  response.status(404).send('Sorry, not found');
});

server.use((error, request, response) => {
  response.status(500).send(error);
});

client.on('error', error => { throw error; })
client.connect().then( () => {server.listen(PORT, () => console.log('Server up on', PORT));})
