const express = require("express")
const path = require("path")
const multer = require("multer")
const { PROXY_AUTHENTICATION_REQUIRED } = require("http-status-codes")
const ejs = require('ejs');
const http = require('http');
const fs = require('fs');
const app = express()
var execSync = require('child_process').execSync;


// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 1 * 1000 * 1000;

// View Engine Setup
app.set("views",path.join(__dirname,"views"))
app.set("view engine","ejs")

// global variables
var dataFileName;  // name of the file to be uploaded
var fileTime;
var outputCsvFileName; // file path for downloading the inference result
var outputJsonFileName; // file path for internal use the inference result

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

// API to upload the file and inference
app.post("/uploadCsv", (req, res, next) => {
	upload(req,res,(err) => {
		if(err) {
			res.send(err)
		}
		else {
			console.log(dataFileName);
			dataFileName = String("./uploads/") + dataFileName;
			// run node python.js
			execSync(String("node python.js ") + dataFileName, (error, stdout, stderr) => {
				if (error) {
					console.log(`exec error: ${error}`);
				}
				// console.log(`stdout: ${stdout}`);
				// console.log(`stderr: ${stderr}`);
			});
			outputCsvFileName = __dirname + "/downloads/output_" + fileTime + ".csv";
			outputJsonFileName = __dirname + "/downloads/output_json_" + fileTime + ".txt";
			// console.log(outputCsvFileName, outputJsonFileName) // for debugging
			res.redirect("/download");
		}
	});
}); // end of post

app.get("/download", (req, res) => {
  var text = fs.readFileSync(outputJsonFileName);
  let paramsJsonData = JSON.parse(text)
  res.render("download", {
    data: paramsJsonData
  });
});


app.get("/single", (req, res) => {
	console.log(outputCsvFileName);
	res.download(outputCsvFileName);
});

// Take any port number of your choice which
// is not taken by any other process
app.listen(3000, (error) => {
	if(error) throw error
		console.log("Server created Successfully on PORT 3000")
});
