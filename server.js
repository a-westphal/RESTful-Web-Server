// Built-in Node.js modules
var fs = require('fs')
var path = require('path')

// NPM modules
var express = require('express')
var sqlite3 = require('sqlite3')


var public_dir = path.join(__dirname, 'public');
var template_dir = path.join(__dirname, 'templates');
var db_filename = path.join(__dirname,'db','stpaul_crime.sqlite3');

var app = express();
var port = 8000;

// open usenergy.sqlite3 database
var db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.log('Error opening ' + db_filename);
    }
    else {
        console.log('Now connected to ' + db_filename);
    }
});

app.use(express.static(public_dir));
var codes = new Object();
var neighborhoods = new Object();
var incidents = new Object();

//GET /codes
app.get('/codes',(req,res) =>{
	//create a javascript object to store the codes: 
	var database_Promise = new Promise ((resolve,reject)=>{
		db.all('SELECT * FROM Codes ORDER BY code',(err,rows)=>{
			rows.forEach(function (row){
				//add the code as a new key and the incident type as a new value 
				codes[row.code] = row.incident_type;
			})

		});

	})
	database_Promise.then(data=>{

	})

}); 

//GET /neighborhoods
app.get('/neighborhoods',(req,res)=>{
	//create a javascript object to store the neighborhood numbers and names 
	var database_Promise = new Promise ((resolve,reject) =>{
		db.all('SELECT * FROM Neighborhoods ORDER BY neighborhood_number',(err,rows)=>{
			rows.forEach(function(row){
				//add the neighborhood number as a new key and the neighborhood name as a new value 
				neighborhoods[row.neighborhood_number] = row.neighborhood_name;
			})

		});

	})

});

//GET /incidents
app.get('/incidents',(req,res)=>{
	//we want the most recent incident number first: 
	var database_Promise = new Promise ((resolve,reject) =>{
		db.all('SELECT * FROM Incidents ORDER BY case_number DESC',(err,rows)=>{
			rows.forEach(function(row){
				//for each case number, a new Object 
				incidents[case_number] = new Object();
				incidents[case_number][date_time] = row.date_time;
				incidents[case_number][code] = row.code;
				incidents[case_number][incident] = row.incident;
				incidents[case_number][police_grid] = row.police_grid;
				incidents[case_number][neighborhood_number] = row.neighborhood_number;
				incidents[case_number][block] = row.block;
			})

		});
	})

});

//PUT /new-incident
app.put('new-incident',(req,res)=>{
	var incidents = new Object();
	var database_Promise = new Promise((resolve,reject)=>{
		db.all('SELECT * FROM Incidents ORDER BY case_number DESC',(err,rows)=>{
			rows.forEach(function(row){
				//for each case number, a new Object 
				incidents[case_number] = new Object();
				incidents[case_number][date_time] = row.date_time;
				incidents[case_number][code] = row.code;
				incidents[case_number][incident] = row.incident;
				incidents[case_number][police_grid] = row.police_grid;
				incidents[case_number][neighborhood_number] = row.neighborhood_number;
				incidents[case_number][block] = row.block;
			})

		});
	})
	database_Promise.then(data=>{
		var new_incident = new Object();
		new_casenum = parseInt(req.body.case_number,10)
		new_incident[new_casenum] = new Object();
		new_incident[new_casenum][date_time] = req.body.date_time;
		new_incident[new_casenum][code] = parseInt(req.body.code,10);
		new_incident[new_casenum][incident] = req.body.incident;
		new_incident[new_casenum][police_grid] = parseInt(req.body.police_grid,10);
		new_incident[new_casenum][neighborhood_number]=parseInt(req.body.neighborhood_number,10);
		new_incident[new_casenum][block] = req.body.block;

		//add the new incident into the incident object
		incidents.push(new_incident);
		/*	db.run(`INSERT INTO Incidents(new_incident) VALUES(?)`,function(err){
		if(err){
	
		}

		})

		*/ 
	})
});

var server = app.listen(port);
