var exec = require('child_process').exec;
var child;

child = exec('python ./python_model/main.py ./python_model/data/interim/inference_data.csv', (error, stdout, stderr) => {
  if (error) {
    console.log(`exec error: ${error}`);
  }
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});


