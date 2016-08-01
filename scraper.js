/* Scraping into DB (18.2.5)
 * ========================== */


/* Students: Using the tools and techniques you learned so far,
 * you will scrape a website of your choice, then place the data
 * in a MongoDB database. Be sure to make the database and collection
 * before running this exercise.

 * Consult the assignment files from earlier in class
 * if you need a refresher on Cheerio. */


// Initialize Express app
var express = require('express');
var app = express();

// Require request and cheerio. This makes the scraping possible
var request = require('request');
var cheerio = require('cheerio');

// Database configuration
var mongojs = require('mongojs');
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on('error', function(err) {
  console.log('Database Error:', err);
});


// Main route (simple Hello World Message)
app.get('/', function(req, res) {
  res.send("Hello world");
});


/* TODO: make two more routes
 * -/-/-/-/-/-/-/-/-/-/-/-/- */

 // Retrieve all data in MongoDB
 app.get('/all', function(req, res) {
 	db.collections.find({}, function (err, found) {
 		res.send(found);
 	});
 });

// Route 1 
// =======
// This route will retrieve all of the data 
// from the scrapedData collection as a json (this will be populated
// by the data you scrape using the next route)

// Scrapa data from website and store in MongoDB
 app.get('/scrape', function(req, res) {
 	request("http://www.fark.com", function (error, response, html) {

	// Load the html into cheerio and save it to a var.
  // '$' becomes a shorthand for cheerio's selector commands, 
  //  much like jQuery's '$'.
  var $ = cheerio.load(html);

  // an empty array to save the data that we'll scrape
  var result = [];

  // Select each instance of the html body that you want to scrape.
  // NOTE: Cheerio selectors function similarly to jQuery's selectors, 
  // but be sure to visit the package's npm page to see how it works.
  $(".headline a").each(function(i, element){
  		var title = $(this).text();
  		var url = $(this).attr('href');
  		result.push({
			title: title,
			url: url
		})

		db.scrapedData.insert({
			title: title,
			url: url
		}, function(err, saved) {
		  	if (err) throw err;
		  });

    // Scrape information from the web page, put it in an object 
    // and add it to the result array. 

    });
  		res.json(result);
});
 });

// Route 2
// =======
// When you visit this route, the server will
// scrape data from the site of your choice, and save it to
// MongoDB.
// TIP: Think back to how you pushed website data  
// into an empty array in the last class. How do you
// push it into a MongoDB collection instead?

/* -/-/-/-/-/-/-/-/-/-/-/-/- */


// listen on port 3000
app.listen(3000, function() {
  console.log('App running on port 3000!');
});
