var exec = require('child_process').exec;
var child;
var fileName = process.argv[2];

child = exec(String("python ./python_model/main.py ") + fileName, (error, stdout, stderr) => {
  if (error) {
    console.log(`exec error: in python ${error}`);
  }
  // console.log(`stdout: ${stdout}`);
  // console.log(`stderr: ${stderr}`);
});
