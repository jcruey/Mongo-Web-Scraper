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
var bodyParser = require('body-parser');

// Require request and cheerio. This makes the scraping possible
var request = require('request');
var cheerio = require('cheerio');

// Database configuration
var mongojs = require('mongojs');
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Require Handlebars to display Scraped Data
var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


// Hook mongojs configuration to the db variable
var db = mongojs('mongodb://heroku_pr2dl1ld:hk0dd4reigsneufsq10826j4ml@ds145315.mlab.com:45315/heroku_pr2dl1ld');
db.on('error', function(err) {
  console.log('Database Error:', err);
});


// Main route 
app.get('/', function(req, res) {
	db.scrapedData.find({}).limit(5, function (err, found) {
 		if(err) throw err;	
  	res.render('index', {
  		articles: found,	
  	});
});
});

 // Retrieve all data in MongoDB
 app.get('/all', function(req, res) {
 	db.scrapedData.find({}, function (err, found) {
 		res.send(found);
 	});
 });

// Route 1 
// =======
// This route will retrieve all of the data 
// from the scrapedData collection as a json (this will be populated
// by the data you scrape using the next route)

// find all comments
app.get('/displayComments', function(req, res) {
  db.books.find({"comment":!null }, function (err, found) {
    if (err) throw err;
    res.render('index', {
    	comment: found
    });
  });
});

// mark a book as having been read
app.post('/newComment/:id', function(req, res) {
  console.log(req.params.id);
  var comment = req.body;
  db.scrapedData.update({"_id": mongojs.ObjectId(req.params.id)}, {$set:{"comment": comment}}, function (err, done) {
    if (err) throw err;
    res.send(done);
  })
  // Remember: when searching by an id, the id needs to be passed in 
  // as (mongojs.ObjectId(IDYOUWANTTOFIND))

});


// mark a book as having been read
app.post('/deleteComment/:id', function(req, res) {
  console.log(req.params.id);
  var comment = req.body;
  db.scrapedData.update({"_id": mongojs.ObjectId(req.params.id)}, {$set:{"comment":null}}, function (err, done) {
    if (err) throw err;
    res.send(done);
  })
  // Remember: when searching by an id, the id needs to be passed in 
  // as (mongojs.ObjectId(IDYOUWANTTOFIND))

});

// Scrape data from website and store in MongoDB
function scrapeData() {
	request("http://www.fark.com", function (error, response, html) {

	// Load the html into cheerio and save it to a var.
  // '$' becomes a shorthand for cheerio's selector commands, 
  //  much like jQuery's '$'.
  var $ = cheerio.load(html);

  // an empty array to save the data that we'll scrape
  var result = [];

  $(".headline a").each(function(i, element){
  		var title = $(this).text();
  		var url = $(this).attr('href');

		db.scrapedData.update({
			title: title,
			url: url,
			comment: null
		}, {
			title: title,
			url: url,
			comment: null
		}, {upsert:true}, function(err, saved) {
		  	if (err) throw err;
		  });

    });
});
}
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

scrapeData();

