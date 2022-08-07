var exec = require('child_process').exec;
var child;

child = exec('python ./python_model/main.py', (error, stdout, stderr) => {
  if (error) {
    console.log(`exec error: ${error}`);
  }
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});


