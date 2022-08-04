
exports.postFromTop = (req, res) => {
	res.render("home");
};

exports.sendReqParam = (req, res) => {
  let veg = req.params.vegetable;
	console.log(req.query);
	res.send(`You asked for ${veg}`);
};

exports.respondWithName = (req, res) => {
  let paramsName = req.params.myName;
  res.render("index", {name: paramsName});
};