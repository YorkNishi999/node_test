// const port = 3000,
// 	express = require('express'),
// 	homeController = require('./controllers/homeController'),
// 	layouts = require('express-ejs-layouts'),
// 	partials = require('express-partials'); 
// 	multer = require('multer'),
// 	app = express();

// app.set('view engine', 'ejs');

// // endpoints
// // app.get("/", (req, res) => { 
// // 	res.send("Hello World! No demons here!");
// // 	console.log(req.params);
// // 	console.log(req.body);
// // 	console.log(req.url);
// // 	console.log(req.query);
// // });

// app.use(
// 	express.urlencoded({
// 		extended: false
// 	})
// );
// app.use(express.json());
// app.use(layouts);
// app.use(partials());

// app.get("/", homeController.postFromTop);
// app.get("/items/:vegetable", homeController.sendReqParam);
// app.post("/name/:myName", homeController.respondWithName);

// app.post("/contact", (req, res) => {
// 	res.send("Contact form submitted!");
// });

// app.listen(port, () => {
// 	console.log('The express.js server has started and is listening on port ' + port);
// 	})

const express = require("express")
const path = require("path")
const multer = require("multer")
const { PROXY_AUTHENTICATION_REQUIRED } = require("http-status-codes")
const app = express()
const ejs = require('ejs');
const http = require('http');
const fs = require('fs');
	
// View Engine Setup
app.set("views",path.join(__dirname,"views"))
app.set("view engine","ejs")
	
// If you do not want to use diskStorage then uncomment it
// var upload = multer({ dest: "Upload_folder_name" })

var dataFileName;
	
var storage = multer.diskStorage({
	destination: function (req, file, cb) {

		// Uploads is the Upload_folder_name
		cb(null, "uploads")
	},
	filename: function (req, file, cb) {
		dataFileName = file.fieldname + "-" + Date.now()+".csv"
		cb(null, dataFileName)
	}
})
	
// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 1 * 1000 * 1000;
	
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

// mypic is the name of file attribute
}).single("myinference");	

app.get("/",function(req,res){
	res.render("uploadcomp");
})
	
app.post("/uploadCsv", (req, res, next) => {
	// Error MiddleWare for multer file upload, so if any
	// error occurs, the image would not be uploaded!
	upload(req,res,(err) => {

		if(err) {

			// ERROR occurred (here it can be occurred due
			// to uploading image of size greater than
			// 1MB or uploading different file type)
			res.send(err)
		}
		else {
			// SUCCESS, image successfully uploaded
			// res.send("Success, CSV uploaded!")
			// res.render("waitInference");
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
			console.log("にゃあ");
			var file = __dirname + "/output.csv";
			res.download(file);
		}
	})
})

app.get("/waitInference", (req, res) => {
	console.log(dataFileName)
})

app.get("/download", (req, res) => {
	res.render("download");
})

					

	
// Take any port number of your choice which
// is not taken by any other process
app.listen(3000, (error) => {
	if(error) throw error
		console.log("Server created Successfully on PORT 3000")
})
