const csvtojson = require('csvtojson');
const fs = require('fs');
const path = require('path');
const { addOneModelDataToRedis, addEval, getEval } = require('./redis');

const csvFolder = path.join(__dirname, '..', 'csvs');
const evalFolder = path.join(__dirname, '..', 'eval');

async function listDir() { //list all files in the csv folder
    try {
        return fs.promises.readdir(csvFolder);
    } catch (err) {
        console.error('Error occured while reading directory!', err);
    }
}

const readCSVFile = async (file) => {
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

const fileDataToJson = JsonWithFile => {
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
    return querys;
}

const readData = async () => {
    const files = await listDir();
    const promises = [];
    const data = []

    files.forEach(file => {
        // promises.push(csvtojson().fromFile(path.join(csvFolder, file)));
        promises.push(readCSVFile(file));
    }
    );

    return await Promise.all(promises).then((jsons) => {//jsons from different files
        jsons.forEach(JsonWithFile => {
            // const json = JsonWithFile.data;
            // const file = JsonWithFile.file;
            // const querys = json.reduce((prev, curr) => {
            //     const qid = curr.qid;
            //     const query = curr.query;

            //     curr = trimQuery(curr);//remove unused fields

            //     let sameQuery = prev.querys.find(query => query.qid === qid);
            //     if (sameQuery !== undefined) {//has same query
            //         sameQuery.data.push(curr);
            //     } else {
            //         sameQuery = { qid: qid, query: query, data: [curr] }//no such query, so create a new one
            //         prev.querys.push(sameQuery);
            //     }
            //     return prev;
            // }, { model: path.parse(file).name, querys: [] });
            const querys = fileDataToJson(JsonWithFile);
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

const processFile = async (file) => {
    return readCSVFile(file).then((jsonWithFile) => {
        return fileDataToJson(jsonWithFile);
    }
    ).then(json => {
        addOneModelDataToRedis(json);
        return json;
    })
}

const processEval = async (file) => {
    const data = await fs.promises.readFile(path.join(evalFolder, file), 'utf8');
    addEval(JSON.parse(data));
}

const getEvalFromRedis = async () => {
    const data = await getEval();
    return data;
}

// readData().then((data) => console.log(data));//this will DEL the csv files

module.exports = { processFile, readData, processEval, getEvalFromRedis };

//https://stackoverflow.com/questions/65434008/wait-for-the-for-loop-to-complete-and-then-return-the-value