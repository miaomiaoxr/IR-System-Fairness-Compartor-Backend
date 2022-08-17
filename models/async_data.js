const csvtojson = require('csvtojson');
const fs = require('fs');
const path = require('path');
const { addOneModelDataToRedis, addEval, setAllModelsEval } = require('./redis');


const csvFolder = path.join(__dirname, '..', 'csvs');
const evalFolder = path.join(__dirname, '..', 'eval');

// async function listDir() { //list all files in the csv folder
//     try {
//         return fs.promises.readdir(csvFolder);
//     } catch (err) {
//         console.error('Error occured while reading directory!', err);
//     }
// }

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
            curr[prop] = JSON.parse(curr[prop].replaceAll("'", '"'));//If there is no table header, it will crash on this line
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
    }, {
        modelName: path.parse(file).name,
        querys: [],
        ver: json[0]['seq_id'] ? 'task2' : 'task1'
    });

    if (querys.ver === 'task2')
        querys.querys.map(query => query.seq_ids = query.data.reduce((prev, curr) => {
            if (!prev.includes(curr.seq_id))
                prev.push(curr.seq_id);
            return prev;
        }, []))

    return querys;
}

// const readData = async () => {
//     const files = await listDir();
//     const promises = [];
//     const data = []

//     files.forEach(file => {
//         promises.push(readCSVFile(file));
//     }
//     );

//     return await Promise.all(promises).then((jsons) => {//jsons from different files
//         jsons.forEach(JsonWithFile => {
//             const querys = fileDataToJson(JsonWithFile);
//             data.push(querys);
//         })
//         return data;//list of models
//     }
//     )

// }

const processFile = async (file) => {
    return readCSVFile(file).then((jsonWithFile) => {
        return fileDataToJson(jsonWithFile);
    }
    ).then((json) => {
        return addOneModelDataToRedis(json);
    })
}

const processEval = async (file) => {
    const data = await fs.promises.readFile(path.join(evalFolder, file), 'utf8');
    return addEval(JSON.parse(data)).then(() => setAllModelsEval())
}


// readData().then((data) => console.log(data));//this will DEL the csv files

module.exports = { processFile, processEval };

