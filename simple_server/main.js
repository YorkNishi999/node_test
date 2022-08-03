const port = 3000,
	// モジュールのロード
	http = require('http'),
	httpStatus = require('http-status-codes'),
	router = require('./router'),
	contentTypes = require('./contentTypes'),
	utils = require('./utils'),
	fs = require('fs');

router.get("/", (req, res) => {
	res.writeHead(httpStatus.OK, contentTypes.html);
	utils.getFile("views/index.html", res);
});

router.get("/contact.html", (req, res) => {
	res.writeHead(httpStatus.OK, contentTypes.html);
	utils.getFile("views/contact.html", res);
});

http.createServer(router.handle).listen(port);
console.log(`Server running at:${port}/`);


