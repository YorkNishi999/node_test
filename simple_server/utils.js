// getFile で使うモジュールをインポート
const fs = require('fs'),
	httpStatus = require('http-status-codes'),
	contentTypes = require('./contentTypes')

module.exports = {
	getFile: (file, res) => {
		fs.readFile(`./${file}`, (errors, data) => {
			if (errors) {
				res.writeHead(httpStatus.INTERNAL_SERVER_ERROR, contentTypes.html);
				res.end("<h1>Internal Server Error</h1>");
			}
			res.end(data);
		})
	}
};