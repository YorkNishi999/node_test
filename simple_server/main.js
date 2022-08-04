const port = 3000,
	express = require('express'),
	homeController = require('./controllers/homeController'),
	layouts = require('express-ejs-layouts'),
	partials = require('express-partials'); 
	app = express();

app.set('view engine', 'ejs');

// endpoints
// app.get("/", (req, res) => { 
// 	res.send("Hello World! No demons here!");
// 	console.log(req.params);
// 	console.log(req.body);
// 	console.log(req.url);
// 	console.log(req.query);
// });

app.use(
	express.urlencoded({
		extended: false
	})
);
app.use(express.json());
app.use(layouts);
app.use(partials());

app.get("/", homeController.postFromTop);
app.get("/items/:vegetable", homeController.sendReqParam);
app.get("/name/:myName", homeController.respondWithName);

app.post("/contact", (req, res) => {
	res.send("Contact form submitted!");
});

app.listen(port, () => {
	console.log('The express.js server has started and is listening on port ' + port);
	})