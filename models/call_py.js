const { PythonShell } = require('python-shell');
const path = require('path');

const options = {
    mode: 'json',//pass JSON to python and get JSON back
    pythonPath: 'C:\\venv\\Scripts\\python.exe',//specify python evironment
    pythonOptions: ['-u'], // get print results in real-time, maybe we can find a async way
}

const pyPath = path.join(__dirname, '..', '..', 'trec2021-fair-public', 'Task1Evaluation.py')//(relative) path to python script you want to call
const pyPath2 = path.join(__dirname, '..', '..', 'trec2021-fair-public', 'Task2Evaluation.py')//(relative) path to python script you want to call


function calcOneModel(queryDocNOs, ver) {
    return new Promise((resolve, reject) => {
        let pyshell = new PythonShell(pyPath, options);

        if (ver === 2)
            pyshell = new PythonShell(pyPath2, options);

        pyshell.send(queryDocNOs);

        pyshell.on('message', function (data) {
            resolve(data);
        })

        pyshell.end(function (err, code, signal) {
            reject(err);
        });
    })
}

module.exports = { calcOneModel };