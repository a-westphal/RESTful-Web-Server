// Built-in Node.js modules
var fs = require('fs');
var path = require('path');

// NPM modules
var express = require('express');
var sqlite3 = require('sqlite3');
var bodyParser = require('body-parser');
//xml variable?

var public_dir = path.join(__dirname, 'public');
var template_dir = path.join(__dirname, 'templates');
var db_filename = path.join(__dirname,'db','stpaul_crime.sqlite3');

var app = express();
var port = 8000;

// open stpaul_crime.sqlite3 database
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

/*	JSON objects for the codes, neighborhoods and incidents to be filled
	by database pulls */ 
var codes = new Object();
var neighborhoods = new Object();
var incidents = new Object();

//GET /codes
app.get('/codes',(req,res) =>{
	//use the url to check the specific extra elements:
	var url =req.url;

	var database_Promise = new Promise ((resolve,reject)=>{
		db.all('SELECT * FROM Codes ORDER BY code',(err,rows)=>{
			rows.forEach(function (row){
				//add the code as a new key and the incident type as a new value 
				let add = "C";

				//specific codes: 
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

				//generic pull, all codes included 
				else{
					codes[add.concat("",row.code)] = row.incident_type;
				}
			})

			resolve(codes);
		});
	}) //database promise

	database_Promise.then(data=>{
		//check if the query string specifices the format type here (to be added later)
		if(req.query.hasOwnProperty("format"))
		{
			//to be edited with the xml stuff
			console.log("if statement");
		}
		else{
			res.type('json').send(codes);
		} 
	})
}); //app.get(Codes)

//GET /neighborhoods
app.get('/neighborhoods',(req,res)=>{
	//url to check for the extra elements:
	var url = req.url;
	console.log(url.length);
	var database_Promise = new Promise ((resolve,reject) =>{
		db.all('SELECT * FROM Neighborhoods ORDER BY neighborhood_number',(err,rows)=>{
			rows.forEach(function(row){
				//string N to concatenate onto the front of the neighborhood:
				let add = "N";

				//specific neighborhood ids 
				if(url.length > 14 && req.query.hasOwnProperty("id"))
				{
					var select_id =  req.query.id.split(',');
					for(let i =0; i < select_id.length; i ++)
					{
						if(row.neighborhood_number == select_id[i])
						{
							neighborhoods[add.concat("",select_id[i])] = row.neighborhood_name;
						}
					} 
				} 

				//generic pull, all neighborhood ids 
				else
				{
					neighborhoods[add.concat("",row.neighborhood_number)] = row.neighborhood_name;
				}	
			})//rows.forEach()

			resolve(neighborhoods);
		});
	}) //database promise 

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

}); //app.get(Neighborhoods)

//GET /incidents
app.get('/incidents',(req,res)=>{
	//url to check for special formatters: 
	var url = req.url;
<<<<<<< HEAD

	var database_Promise = new Promise ((resolve,reject) =>{
		db.all('SELECT * FROM Incidents ORDER BY case_number DESC LIMIT 10000',(err,rows)=>{
			//pulling everything from incidents, limiting it to 10000 values to output
			var count = 0;	//count for the limit less than 10000
=======
	var database_Promise = new Promise ((resolve,reject) =>{
		db.all('SELECT * FROM Incidents ORDER BY case_number DESC LIMIT 10000',(err,rows)=>{
			//pulling everything from incidents, limiting it to 10000 values to output
			var count = 0;
>>>>>>> a74a64ac503bb08eb19bd4ca391566db1c62f771
			rows.forEach(function(row){
				let add = "I"; 
				let case_number = add.concat("",row.case_number);

				//date_time split by the T to have the date and time separately
				let date_time = row.date_time.split("T");	

				//specific id value: 
				if(url.length > 10 && req.query.hasOwnProperty("id")){
						
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

				//specific grid value: 
				else if(url.length > 10 && req.query.hasOwnProperty("grid"))
				{
					var select_grid = req.query.grid.split(',');
					for(let i =0; i < select_grid.length; i ++)
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

				//specific code value: 
				else if(url.length > 10 && req.query.hasOwnProperty("code"))
				{
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

				//specific start_date value: 
				else if(url.length > 10 && req.query.hasOwnProperty("start_date"))
				{
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

				//specific end_date value: 
				else if(url.length > 10 && req.query.hasOwnProperty("end_date"))
				{
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

				//specific limit value: 
				else if(url.length > 10 && req.query.hasOwnProperty("limit"))
				{	
					//since we are in a db pull, we can just count each row until the limit is reached 
<<<<<<< HEAD
=======
					//console.log("in limit else");
>>>>>>> a74a64ac503bb08eb19bd4ca391566db1c62f771
					let limit = req.query.limit;
					//console.log("limit is: " + limit);
					//console.log("count is : " + count);

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

<<<<<<< HEAD
				//generic pull, all information included:
				else
				{
					incidents[case_number] = new Object();
					incidents[case_number]["date"] = date_time[0];
					incidents[case_number]["time"] = date_time[1];
					incidents[case_number]["code"] = row.code;
					incidents[case_number]["incident"] = row.incident;
					incidents[case_number]["police_grid"] = row.police_grid;
					incidents[case_number]["neighborhood_number"] = row.neighborhood_number;
					incidents[case_number]["block"] = row.block;
=======
				else{

						incidents[case_number] = new Object();
						incidents[case_number]["date"] = date_time[0];
						incidents[case_number]["time"] = date_time[1];
						incidents[case_number]["code"] = row.code;
						incidents[case_number]["incident"] = row.incident;
						incidents[case_number]["police_grid"] = row.police_grid;
						incidents[case_number]["neighborhood_number"] = row.neighborhood_number;
						incidents[case_number]["block"] = row.block;

>>>>>>> a74a64ac503bb08eb19bd4ca391566db1c62f771
				}
				
			})
			resolve(incidents);
		});
	})//database Promise 
	database_Promise.then(data =>{
		//check if the query string specifies the format type here

		if(req.query.hasOwnProperty("format"))
		{
			//to be edited with the xml stuff

			console.log("if statement"); 
		}
		else
		{
			res.type('json').send(incidents);
		} 
	})

}); //app.get(Incidents)

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
		db.all('SELECT case_number FROM Incidents ORDER BY case_number DESC',(err,rows)=>{
			rows.forEach(function(row){
				//error checking for a pre-existing case number trying to be inserted: 
				if(new_casenum == row.case_number)
				{
					res.writeHead(500, {'Content-Type': 'text/plain'});
	    			res.write('Error: case number already within database: ' + new_casenum);
	    			res.end();
				}
			})
			resolve(incidents);
		})
	}); //database promise

	//we've already checked the casenumber, now insert into the table:
	incident_pull.then(data =>{

		db.run('INSERT INTO Incidents(case_number,date,time,code,incident,police_grid,neighborhood_number,block) VALUES(new_casenum,date_time[0],date_time[1],new_code,new_incident,new_grid,new_neighborhood,new_block', ['C'],function(err){
			//check if there is already a case number that matches the one to be inserted in the db
			if(err)
			{
				res.writeHead(404, {'Content-Type': 'text/plain'});
    			res.write('Error: could not write to database');
    			res.end();
			}	
			else
			{
				res.writeHead({'Content-Type':'text/plain'})
				res.write('Input to database successful!');
				res.end();
			}
		
		}) //db run

	}); //incident_pull.then

});//app.PUT

var server = app.listen(port);
