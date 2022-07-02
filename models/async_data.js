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

const processSinglefile = async (file) => {
    return new Promise((resolve, reject) => {
        csvtojson()
            .fromFile(path.join(csvFolder, file))
            .then((data) => {
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
    curr.gender = JSON.parse(curr.gender.replaceAll("'", '"'))// "[]" to []
    curr.geographic_locations = JSON.parse(curr.geographic_locations.replaceAll("'", '"'))

    return curr;
}

const readData = async (callback) => {
    const files = await listDir();
    const promises = [];
    const data = []

    files.forEach(file => {
        // promises.push(csvtojson().fromFile(path.join(csvFolder, file)));
        promises.push(processSinglefile(file));
    }
    );

    Promise.all(promises).then((jsons) => {//jsons from different files
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
            }, { model: file, querys: [] });
            data.push(querys);
        })
        return;
    }
    ).then(() => {
        callback(data);
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

readData((data) => console.log(data));

module.exports = { readData };

//https://stackoverflow.com/questions/65434008/wait-for-the-for-loop-to-complete-and-then-return-the-value