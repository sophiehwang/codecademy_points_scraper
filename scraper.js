// This is a template for a Node.js scraper on morph.io (https://morph.io)

var cheerio = require("cheerio");
var request = require("request");
var postRquest = require('request');
var sqlite3 = require("sqlite3").verbose();
var codecademyID =  'scriptMaster99299';
var offset = 209; // 7/4 baseline
var beeminderAuthToken = 'Bpyqep924B9Z2WotsmdF';
var beeminderUsr = "dotdotdot";
var beeminderGoal = "codecademy";
var beeminderURL = 'https://www.beeminder.com/api/v1/users/'+ beeminderUsr + '/goals/'+
										beeminderGoal + '/datapoints.json?auth_token='+ beeminderAuthToken;

function initDatabase(callback) {
	// Set up sqlite database.
	var db = new sqlite3.Database("data.sqlite");
	db.serialize(function() {
		db.run("CREATE TABLE IF NOT EXISTS data (points, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
		callback(db);
	});
}

function updateRow(db, value) {
	// Insert some data.
	var statement = db.prepare("INSERT INTO data (points) VALUES (?)");
	statement.run(value);
	statement.finalize();
}

function readRows(db) {
	// Read some data.
	db.each("SELECT rowid AS id, points, created_at FROM data", function(err, row) {
		console.log(row.id + ": " + row.points);
	});
}

function fetchPage(url, callback) {
	// Use request to read in pages.
	request(url, function (error, response, body) {
		if (error) {
			console.log("Error requesting page: " + error);
			return;
		}

		callback(body);
	});
}


function run(db) {
	// Use request to read in pages.
	fetchPage("http://www.codecademy.com/" + codecademyID , function (body) {
		// Use cheerio to find things in the page with css selectors.
		var $ = cheerio.load(body);

		var points = $('h3.padding-right--quarter').eq(0).text();
		points = points - offset;
		console.log(points);

		updateRow(db, points);

		readRows(db);
		db.close();



		//post to beeminder
		postRquest({
			url: beeminderURL + '&value=' + points , //URL to hit
			method: 'POST'
		}, function(error, response, body){
			if(error) {
					console.log(error);
			} else {
					console.log(response.statusCode, body);
			}
		});
		//end of beeminder POST


	});
}

initDatabase(run);
