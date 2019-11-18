// Built-in Node.js modules
var fs = require('fs');
var path = require('path');

// NPM modules
var express = require('express');
var sqlite3 = require('sqlite3');
var bodyParser = require('body-parser');


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
app.use(bodyParser.urlencoded({extended: true}));

var codes = new Object();
var neighborhoods = new Object();
var incidents = new Object();

//GET /codes
app.get('/codes',(req,res) =>{
	//create a javascript object to store the codes: 
	//console.log(req.query.code);

	var url =req.url;

	var database_Promise = new Promise ((resolve,reject)=>{
		db.all('SELECT * FROM Codes ORDER BY code',(err,rows)=>{
			rows.forEach(function (row){
				//add the code as a new key and the incident type as a new value 
				let add = "C";

				if(url.length > 6 && req.query.hasOwnProperty("code")){
						
					var select_code =  req.query.code.split(',');
					console.log("selected codes:" + select_code);
					console.log("db row: " +row.code);
					for(let i =0; i < select_code.length; i ++)
					{
						if(row.code == select_code[i])
						{
							console.log("row code is:" + row.code);
							codes[add.concat("",select_code[i])] = row.incident_type;
						}
					}
				}

				else{
					codes[add.concat("",row.code)] = row.incident_type;
				}

			})

			resolve(codes);

		});

	})
	database_Promise.then(data=>{
		//check if the query string specifices the format type here (to be added later)
		let formatter = "json";

		if(req.query.hasOwnProperty("format"))
		{
			//to be edited with the xml stuff
			console.log("if statement");
			//edit something to xml 
		}
		else{
			res.type('json').send(codes);
		} 

		//res.type('json').send(codes);
	})

}); 

//GET /neighborhoods
app.get('/neighborhoods',(req,res)=>{
	//create a javascript object to store the neighborhood numbers and names 
	var url = req.url;
	console.log(url.length);
	var database_Promise = new Promise ((resolve,reject) =>{
		db.all('SELECT * FROM Neighborhoods ORDER BY neighborhood_number',(err,rows)=>{
			rows.forEach(function(row){
				//add the neighborhood number as a new key and the neighborhood name as a new value 
				let add = "N";

				if(url.length > 14 && req.query.hasOwnProperty("id")){
						
					var select_id =  req.query.id.split(',');
					//console.log("selected codes:" + select_id);
					//console.log("db row: " +row.neighborhood_number);
					for(let i =0; i < select_id.length; i ++)
					{
						if(row.neighborhood_number == select_id[i])
						{
							//console.log("row id is:" + row.neighborhood_number);
							neighborhoods[add.concat("",select_id[i])] = row.neighborhood_name;
						}
					}
				}

				else{
					neighborhoods[add.concat("",row.neighborhood_number)] = row.neighborhood_name;
				}
				
			})

			resolve(neighborhoods);
		});
	})

	database_Promise.then(data => {
		//check if the query string specifies the format type here (to be added later)
			let formatter = "json";

		if(req.query.hasOwnProperty("format"))
		{
			//to be edited with the xml stuff
			console.log("if statement");
			//edit something to xml 
		}
		else{
			res.type('json').send(neighborhoods);
		} 

	})

});

//GET /incidents
app.get('/incidents',(req,res)=>{
	//we want the most recent incident number first: 
	var url = req.url;
	console.log(url.length);
	var database_Promise = new Promise ((resolve,reject) =>{
		var count = 0;
		db.all('SELECT * FROM Incidents ORDER BY case_number DESC',(err,rows)=>{
			rows.forEach(function(row){
				//for each case number, a new Object
				let add = "I"; 
				let case_number = add.concat("",row.case_number);
				let date_time = row.date_time.split("T");

				if(url.length > 10 && req.query.hasOwnProperty("id")){
					console.log(" in id else");
						
					var select_id =  req.query.id.split(',');
					for(let i =0; i < select_id.length; i ++)
					{
						if(row.neighborhood_number == select_id[i])
						{
							incidents[case_number] = new Object();
							incidents[case_number]["date"] = date_time[0];
							incidents[case_number]["time"] = date_time[1];
							incidents[case_number]["code"] = row.code;
							incidents[case_number]["incident"] = row.incident;
							incidents[case_number]["police_grid"] = row.police_grid;
							incidents[case_number]["neighborhood_number"] = select_id[i];
							incidents[case_number]["block"] = row.block;
						}
					}
				}

				else if(url.length > 10 && req.query.hasOwnProperty("grid"))
				{
					console.log("in grid else");
					var select_grid = req.query.grid.split(',');
					for(let i =0; i < select_id.length; i ++)
					{
						if(row.police_grid == select_grid[i])
						{
							incidents[case_number] = new Object();
							incidents[case_number]["date"] = date_time[0];
							incidents[case_number]["time"] = date_time[1];
							incidents[case_number]["code"] = row.code;
							incidents[case_number]["incident"] = row.incident;
							incidents[case_number]["police_grid"] = select_grid[i];
							incidents[case_number]["neighborhood_number"] = row.neighborhood_number;
							incidents[case_number]["block"] = row.block;
						}
					}

				}

				else if(url.length > 10 && req.query.hasOwnProperty("code"))
				{
					console.log("in code else");
					var select_code = req.query.code.split(',');
					for(let i =0; i < select_code.length; i++)
					{
						if(row.code == select_code[i])
						{
							incidents[case_number] = new Object();
							incidents[case_number]["date"] = date_time[0];
							incidents[case_number]["time"] = date_time[1];
							incidents[case_number]["code"] = select_code[i];
							incidents[case_number]["incident"] = row.incident;
							incidents[case_number]["police_grid"] = row.police_grid;
							incidents[case_number]["neighborhood_number"] = row.neighborhood_number;
							incidents[case_number]["block"] = row.block;
						}
					}
				}

				else if(url.length > 10 && req.query.hasOwnProperty("start_date"))
				{
					console.log("in start else");
					let start = req.query.start_date;
					if(row.date >= start)
					{
						incidents[case_number] = new Object();
						incidents[case_number]["date"] = date_time[0];
						incidents[case_number]["time"] = date_time[1];
						incidents[case_number]["code"] = row.code;
						incidents[case_number]["incident"] = row.incident;
						incidents[case_number]["police_grid"] = row.police_grid;
						incidents[case_number]["neighborhood_number"] = row.neighborhood_number;
						incidents[case_number]["block"] = row.block;
					}
				}

				else if(url.length > 10 && req.query.hasOwnProperty("end_date"))
				{
					console.log("in end date else");
					let end = req.query.end_date;
					if(row.date <= end)
					{
						incidents[case_number] = new Object();
						incidents[case_number]["date"] = date_time[0];
						incidents[case_number]["time"] = date_time[1];
						incidents[case_number]["code"] = row.code;
						incidents[case_number]["incident"] = row.incident;
						incidents[case_number]["police_grid"] = row.police_grid;
						incidents[case_number]["neighborhood_number"] = row.neighborhood_number;
						incidents[case_number]["block"] = row.block;
					}
				}

				else if(url.length > 10 && req.query.hasOwnProperty("limit"))
				{	
					//since we are in a db pull, we can just count each row until the limit is reached 
					console.log("in limit else");
					let limit = req.query.limit;

					if(count < limit)
					{	
						incidents[case_number] = new Object();
						incidents[case_number]["date"] = date_time[0];
						incidents[case_number]["time"] = date_time[1];
						incidents[case_number]["code"] = row.code;
						incidents[case_number]["incident"] = row.incident;
						incidents[case_number]["police_grid"] = row.police_grid;
						incidents[case_number]["neighborhood_number"] = row.neighborhood_number;
						incidents[case_number]["block"] = row.block;
					}

					count++;
				}

				//need start and end date

				else{

					console.log("count = "  + count);
					if(count <= 10000)
					{
						incidents[case_number] = new Object();
						incidents[case_number]["date"] = date_time[0];
						incidents[case_number]["time"] = date_time[1];
						incidents[case_number]["code"] = row.code;
						incidents[case_number]["incident"] = row.incident;
						incidents[case_number]["police_grid"] = row.police_grid;
						incidents[case_number]["neighborhood_number"] = row.neighborhood_number;
						incidents[case_number]["block"] = row.block;
						count = count + 1;
					}

				}

				
			})

			console.log("final count = " + count);
			resolve(incidents);
		});
	})
	database_Promise.then(data =>{
		//check if the query string specifies the format type here (to be added later)
		res.type('json').send(incidents);
	})

});

//PUT /new-incident
app.put('new-incident',(req,res)=>{

	var new_incident = new Object();
	var new_casenum = parseInt(req.body.case_number,10)
	var date_time = req.body.date_time.split("T");

	var new_code = parseInt(req.body.code,10);
	var new_incident = req.body.incident;
	var new_grid = parseInt(req.body.police_grid,10);
	var new_neighborhood = parseInt(req.body.neighborhood_number,10);
	var new_block = req.body.block;

	new_incident[new_casenum] = new Object();
	new_incident[new_casenum][date] = date_time[0];
	new_incident[new_casenum][time] = date_time[1]
	new_incident[new_casenum][code] = new_code;
	new_incident[new_casenum][incident] = new_incident;
	new_incident[new_casenum][police_grid] = new_grid;
	new_incident[new_casenum][neighborhood_number]=new_neighborhood;
	new_incident[new_casenum][block] = new_block;

	var incident_pull = new Promise((resolve,reject) =>{
		db.all('SELECT * FROM Incidents ORDER BY case_number DESC',(err,rows)=>{
			rows.forEach(function(row){
				//for each case number, a new Object
				let add = "I"; 
				let case_number = add.concat("",row.case_number);
				let date_time = row.date_time.split("T");

				incidents[case_number] = new Object();
				incidents[case_number]["date"] = date_time[0];
				incidents[case_number]["time"] = date_time[1];
				incidents[case_number]["code"] = row.code;
				incidents[case_number]["incident"] = row.incident;
				incidents[case_number]["police_grid"] = row.police_grid;
				incidents[case_number]["neighborhood_number"] = row.neighborhood_number;
				incidents[case_number]["block"] = row.block;
			})

			resolve(incidents);
		
		})

	})
	incident_pull.then(data =>{
		db.run('INSERT INTO Incidents(case_number,date,time,code,incident,police_grid,neighborhood_number,block) VALUES(new_casenum,date_time[0],date_time[1],new_code,new_incident,new_grid,new_neighborhood,new_block', ['C'],function(err){
		
			//check if there is already a case number that matches the one to be inserted in the db
			for(let i =0; i < data.length; i ++)
			{
				if(data[i] == new_casenum)
				{
					res.writeHead(500, {'Content-Type': 'text/plain'});
    				res.write('Error: case number already within database');
    				res.end();
				}
			}

			if(err)
			{
				res.writeHead(404, {'Content-Type': 'text/plain'});
    			res.write('Error: could not write to database');
    			res.end();
			}	

			else{
				res.writeHead({'Content-Type':'text/plain'})
				res.write('Input to database successful!');
				res.end();
			}
		
		})

	});

});

var server = app.listen(port);
