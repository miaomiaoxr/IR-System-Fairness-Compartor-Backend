const csvtojson = require('csvtojson');
const fs = require('fs');
const path = require('path');

const csvFolder = path.join(__dirname, '..', 'csvs');

async function listDir() { //list all files in the csv folder
    try {
        return fs.promises.readdir(csvFolder);
    } catch (err) {
        console.error('Error occured while reading directory!', err);
    }
}

const processSingleFile = async (file) => {
    return new Promise((resolve, reject) => {
        csvtojson({ ignoreEmpty: true })
            .fromFile(path.join(csvFolder, file))
            .then(async (data) => {
                // await fs.promises.unlink(path.join(csvFolder, file));//delete the file after reading
                resolve({ file, data });
            })
            .catch((err) => {
                reject(err);
        });
    })
}

const trimQuery = (curr) => {
    delete curr.qid;
    delete curr.query;
    delete curr.field1;

    delete curr.genders;
    // curr.gender = JSON.parse(curr.gender.replaceAll("'", '"'))// "[]" to []
    // curr.geographic_locations = JSON.parse(curr.geographic_locations.replaceAll("'", '"'))

    for (let prop in curr) {
        if (curr.hasOwnProperty(prop)) {
            curr[prop] = JSON.parse(curr[prop].replaceAll("'", '"'));
        }
    }

    return curr;
}

const readData = async () => {
    const files = await listDir();
    const promises = [];
    const data = []

    files.forEach(file => {
        // promises.push(csvtojson().fromFile(path.join(csvFolder, file)));
        promises.push(processSingleFile(file));
    }
    );

    return await Promise.all(promises).then((jsons) => {//jsons from different files
        jsons.forEach(JsonWithFile => {
            const json = JsonWithFile.data;
            const file = JsonWithFile.file;
            const querys = json.reduce((prev, curr) => {
                const qid = curr.qid;
                const query = curr.query;

                curr = trimQuery(curr);//remove unused fields

                let sameQuery = prev.querys.find(query => query.qid === qid);
                if (sameQuery !== undefined) {//has same query
                    sameQuery.data.push(curr);
                } else {
                    sameQuery = { qid: qid, query: query, data: [curr] }//no such query, so create a new one
                    prev.querys.push(sameQuery);
                }
                return prev;
            }, { model: path.parse(file).name, querys: [] });
            data.push(querys);
        })
        return data;//list of models
    }
    )
    // return new Promise((resolve, reject) => {
    //     fs.readdir(csvFolder, (err, files) => {
    //         if (err) throw err;
    //         else {
    //             // files.forEach(async (file) => {
    //             //     let filedata = {
    //             //         filename: file,
    //             //         data: []
    //             //     };
    //             //     csvtojson().fromFile(path.join(csvFolder, file)).then((json) => {
    //             //         // console.log(json);
    //             //         filedata.data.push(...json);
    //             //     }
    //             //     );
    //             //     data.push(filedata);

    //             // }
    //             // )
    //             for (let file of files) {
    //                 let filedata = {
    //                     filename: file,
    //                     data: []
    //                 };
    //                 csvtojson().fromFile(path.join(csvFolder, file)).then((json) => {
    //                     // console.log(json);
    //                     filedata.data.push(...json);
    //                 }
    //                 );
    //                 data.push(filedata);
    //             }
    //         }
    //     })
    //     resolve();
    // }
    // )
}

// readData().then((data) => console.log(data));//this will DEL the csv files

module.exports = { readData };

//https://stackoverflow.com/questions/65434008/wait-for-the-for-loop-to-complete-and-then-return-the-value