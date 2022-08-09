const express = require("express")
const path = require("path")
const multer = require("multer")
const { PROXY_AUTHENTICATION_REQUIRED } = require("http-status-codes")
const ejs = require('ejs');
const http = require('http');
const fs = require('fs');
const app = express()

// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 1 * 1000 * 1000;

// View Engine Setup
app.set("views",path.join(__dirname,"views"))
app.set("view engine","ejs")

// global variables
var dataFileName;  // name of the file to be uploaded
var fileTime;

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads") // "uploads" is the folder name
	},
	filename: function (req, file, cb) {
		fileTime = Date.now()
		dataFileName = file.fieldname + "_" + fileTime + ".csv"
		cb(null, dataFileName)
	}
})

var upload = multer({
	storage: storage,
	limits: { fileSize: maxSize },
	fileFilter: function (req, file, cb){
	
		// Set the filetypes, it is optional
		var filetypes = /csv/;
		var mimetype = filetypes.test(file.mimetype);

		var extname = filetypes.test(path.extname(
					file.originalname).toLowerCase());
		
		if (mimetype && extname) {
			return cb(null, true);
		}
	
		cb("Error: File upload only supports the "
				+ "following filetypes - " + filetypes);
	}

// myinference is the name of file attribute in html form
}).single("myinference");	

app.get("/",function(req,res){
	res.render("uploadcomp");
})

// API to upload the file
app.post("/uploadCsv", (req, res, next) => {
	upload(req,res,(err) => {

		if(err) {
			res.send(err)
		}
		else {
			console.log(dataFileName);
			dataFileName = String("./uploads/") + dataFileName;

			// run node python.js
			var execSync = require('child_process').execSync;
			execSync(String("node python.js ") + dataFileName, (error, stdout, stderr) => {
				if (error) {
					console.log(`exec error: ${error}`);
				}
				// console.log(`stdout: ${stdout}`);
				// console.log(`stderr: ${stderr}`);
			});
			var outputFileName = __dirname + "/downloads/output" + "_" + fileTime + ".csv";
			// res.render("download");
			res.download(outputFileName);
		}
	})
})

// app.get("/waitInference", (req, res) => {
// 	console.log(dataFileName)
// })

// app.get("/download", (req, res) => {
// 	res.render("download");
// })

// Take any port number of your choice which
// is not taken by any other process
app.listen(3000, (error) => {
	if(error) throw error
		console.log("Server created Successfully on PORT 3000")
})
