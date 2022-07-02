const csvtojson = require('csvtojson');
const fs = require('fs');
const path = require('path');

//traverse the csvs folder and convert all csv files to json
const csvFolder = path.join(__dirname, '..', 'csvs');
let data = [];

console.log('generating json from csvs...');
fs.readdir(csvFolder, (err, files) => {
    if (err) throw err;
    else {
        files.forEach(file => {
            let filedata = {
                filename: file,
                data: []
            };
            csvtojson().fromFile(path.join(csvFolder, file)).then((json) => {
                // console.log(json);
                filedata.data.push(...json);
            }
            );
            data.push(filedata);
        }
        );

    }
})


module.exports = { data };


// const data = [{hand: "KdAhAsKs", checkPct: 28}, {hand: "KdAhAsKs", betPct: 72},{hand: "KcAhAsKs", checkPct: 28}, { hand: "KcAhAsKs", betPct: 72}],
//     result = Object.values(data.reduce((r,{hand, ...rest}) => {
//       r[hand] = r[hand] || {hand};
//       r[hand] = {...r[hand], ...rest};
//       return r;
//     },{}));
// console.log(result);