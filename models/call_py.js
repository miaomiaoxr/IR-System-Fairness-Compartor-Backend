const { PythonShell } = require('python-shell');
const path = require('path');
const { qidWithDocNos } = require('./redis');


function callD_alembert(req, res) {
    var options = {
        mode: 'json',//pass JSON to python and get JSON back
        pythonPath: 'C:\\venv\\Scripts\\python.exe',//specify python evironment
        pythonOptions: ['-u'], // get print results in real-time, maybe we can find a async way
        args://not use now
            [
                req.query.funds, // starting funds
                req.query.size, // (initial) wager size
                req.query.count, // wager count — number of wagers per sim
                req.query.sims // number of simulations
            ]
    }

    // const pyPath = path.join(__dirname, '..', 'py', 'd_alembert.py')
    const pyPath = path.join(__dirname, '..', '..', 'trec2021-fair-public', 'Task1Evaluation.py')//(relative) path to python script you want to call
    // const pyPath = path.join(__dirname, '..', '..', 'trec2021-fair-public', 'd_alembert.py')

    console.log('path', pyPath)

    let pyshell = new PythonShell(pyPath, options);

    qidWithDocNos().then(data => {
        const sendData = data;
        console.log('data', sendData)

        pyshell.send(sendData);

        pyshell.on('message', function (message) {
            // received a message sent from the Python script (a simple "print" statement)

            console.log('message', message);
            res.json(message);
        });

        // end the input stream and allow the process to exit
        pyshell.end(function (err, code, signal) {
            if (err) throw err;
            console.log('The exit code was: ' + code);
            console.log('The exit signal was: ' + signal);
            console.log('finished');
        });
    })
    // PythonShell.run(pyPath, options, function (err, data) {
    //     if (err) res.send(err);
    //     console.log('data',data)
    //     res.send(data.toString())
    // });
}

module.exports = { callD_alembert };