const redis = require('redis');
const { v4: uuidv4 } = require('uuid');
const { genEvalForOneModel } = require('./eval_calc');
const { calcOneModel: calcOneModelPy } = require('./call_py');
const e = require('cors');

const clientInit = () => {
    return new Promise(async (resolve, reject) => {
        // const client = redis.createClient({
        //     socket: { host: '192.168.37.128' }//JUST ON MY COMPUTER
        // });
        const client = redis.createClient();//WSL version

        client.on('error', (err) => console.log('Redis Client Error', err));

        await client.connect();
        resolve(client);
    })
}

const setOnefile = async (model, client) => {
    const id = uuidv4();
    model.id = id;

    const dataID = id + '_data';
    await client.set(dataID, JSON.stringify(model.querys));

    let wroteModel = { ...model };
    wroteModel.querys = dataID;
    await client.SADD('modelSet', id);
    if (model.ver === 'task1') await client.SADD('task1ModelSet', id);
    else await client.SADD('task2ModelSet', id);
    await client.set(id, JSON.stringify(wroteModel));

    model.pyEval = await setOneModelPyEvals(id, client);

    const evalSet = await client.SMEMBERS('evalSet');
    if (!evalSet)
        return model;
    else
        return setOneModelEval(id, evalSet, client);
}

const readOneModel = async (modelID, client) => {
    const data = JSON.parse((await client.get(modelID)));
    data.querys = JSON.parse((await client.get(data.querys)));

    return data;
}

const readDataFromRedis = async () => {
    const client = await clientInit();
    const modelIDs = await client.SMEMBERS('modelSet');
    if (modelIDs.length === 0) return [];

    const promises = [];
    modelIDs.forEach(modelID => promises.push(readOneModel(modelID, client)));

    const res = [];


    return Promise.all(promises).then(models => {
        models.forEach(model => res.push(model));
    }).then(() => client.quit()).then(() => res);
}

const addOneModelDataToRedis = async (model) => {
    const client = await clientInit();
    return setOnefile(model, client).then(async (data) => {
        await client.quit();
        return data;
    }
    );
}

const addEval = async (jsons) => {
    const client = await clientInit();

    const promises = [];
    jsons.forEach(json => {
        promises.push(addOneEval(json, client));
    })

    return Promise.all(promises).then(() => client.quit())
}

const addOneEval = async (json, client) => {
    await client.set(json.id + 'eval', JSON.stringify(json));
    return client.SADD('evalSet', json.id + 'eval')
}


const deleteOneModel = async (modelID) => {
    const client = await clientInit();
    const data = JSON.parse((await client.get(modelID)));

    const ver = data.ver;
    if(ver === 'task1') await client.SREM('task1ModelSet', modelID);
    else await client.SREM('task2ModelSet', modelID);

    await client.del(data.querys);
    await client.SREM('modelSet', modelID);
    await client.del(modelID);
    return client.quit();
}

const renameOneModel = async (modelID, newName) => {
    const client = await clientInit();

    const data = JSON.parse((await client.get(modelID)));
    data.modelName = newName;
    await client.set(modelID, JSON.stringify(data));

    return client.quit();
}

const getEvalInNeed = async (evalInNeed, client) => {
    const promises = evalInNeed.map(async (evalID) => JSON.parse(await client.get(evalID)));
    return Promise.all(promises);
}

const setOneModelEval = async (modelID, evalSet, client) => {
    const model = JSON.parse((await client.get(modelID)));
    const querys = JSON.parse((await client.get(model.querys)));

    const qids = querys.map(query => query.qid);

    if (model.ver === 'task1') {
        const evalInNeed = evalSet.filter(evalID => qids.includes(evalID.split('eval')[0]));

        const evalList = await getEvalInNeed(evalInNeed, client);

        const evals = genEvalForOneModel(querys, evalList);

        model.evals = evals;
    }

    if (model.ver === 'task2') {
        const promises = [];
        querys.forEach(query => {
            const toPy = [];
            query.data.forEach(doc => {
                toPy.push({ topic_id: query.qid, seq_no: doc.seq_id, page_id: '' + doc.docno });
            })
            promises.push(calcOneModelPy(toPy, 2));
        })
        await Promise.all(promises).then(evals => {
            const evalsInFormat = evals.reduce((pre, curr) => {
                const qid = Object.keys(curr['EE-L'])[0];
                const ret = {[qid]:{}};

                for (let k in curr)
                    ret[qid][k] = curr[k][qid];
                pre = {...pre, ...ret};
                return pre;
            }, {})
            model.evals = evalsInFormat
        });
    }


    return client.set(modelID, JSON.stringify(model)).then(() => { model.querys = querys; return model });
}

const setAllModelsEval = async () => { //every time upload a eval file, call this function(only for task1)
    const client = await clientInit();
    const task1ModelSet = await client.SMEMBERS('task1ModelSet');
    const evalSet = await client.SMEMBERS('evalSet');

    const promises = [];
    task1ModelSet.forEach(async (modelID) => {
        promises.push(setOneModelEval(modelID, evalSet, client));
    })

    return Promise.all(promises).then(async (models) => {
        await client.quit();
        return models.map(model => { return { id: model.id, evals: model.evals } });
    })
}


const setOneModelPyEvals = async (modelID, client) => {
    const model = JSON.parse((await client.get(modelID)));
    const querys = JSON.parse((await client.get(model.querys)));
    let ver = 1;
    if (model.ver === 'task2') ver = 2;

    const toPy = [];
    querys.forEach(query => {
        query.data.forEach(doc => {
            if (!doc.seq_id)
                toPy.push({ topic_id: '101', page_id: '' + doc.docno });//Python eval script need topic_id to be a number
            else
                toPy.push({ topic_id: '101', seq_no: doc.seq_id, page_id: '' + doc.docno });
        })
    })

    return calcOneModelPy(toPy, ver).then(data => {
        for (let k in data)
            data[k] = data[k]['101'];//remove useless topic_id
        model.pyEval = data;
        return client.set(modelID, JSON.stringify(model)).then(() => data);
    })
}

// delAll()
// addToRedis();
module.exports = { readDataFromRedis, addOneModelDataToRedis, addEval, deleteOneModel, renameOneModel, setAllModelsEval, setOneModelPyEvals };