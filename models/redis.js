const redis = require('redis');
const { v4: uuidv4 } = require('uuid');
const { genEvalForOneModel } = require('./eval_calc');
const { calcOneModel: calcOneModelPy } = require('./call_py');

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
    // await client.quit();

    // return res;
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

const delAll = async () => {
    const client = await clientInit();
    const promises = [];
    const keys = await client.keys('*')

    keys.forEach(key => promises.push(client.del(key)))
    await Promise.all(promises).then(async () => {
        await client.quit();
    })
}

const getEval = async () => {
    const client = await clientInit();
    const data = await client.get('eval');
    await client.quit();
    return JSON.parse(data);
}

const deleteOneModel = async (modelID) => {
    const client = await clientInit();
    const data = JSON.parse((await client.get(modelID)));
    await client.del(data.querys);
    await client.SREM('modelSet', modelID);
    await client.del(modelID);
    await client.quit();
}

const renameOneModel = async (modelID, newName) => {
    const client = await clientInit();

    const data = JSON.parse((await client.get(modelID)));
    data.modelName = newName;
    await client.set(modelID, JSON.stringify(data));

    await client.quit();
}

const getEvalInNeed = async (evalInNeed, client) => {
    const promises = evalInNeed.map(async (evalID) => JSON.parse(await client.get(evalID)));
    return Promise.all(promises);
}

const setOneModelEval = async (modelID, evalSet, client) => {
    const model = JSON.parse((await client.get(modelID)));
    const querys = JSON.parse((await client.get(model.querys)));

    const qids = querys.map(query => query.qid);
    const evalInNeed = evalSet.filter(evalID => qids.includes(evalID.split('eval')[0]));

    const evalList = await getEvalInNeed(evalInNeed, client);

    const evals = genEvalForOneModel(querys, evalList);

    model.evals = evals;
    return client.set(modelID, JSON.stringify(model)).then(() => { model.querys = querys; return model });
}

const setAllModelsEval = async () => { //every time upload a eval file, call this function
    const client = await clientInit();
    const modelSet = await client.SMEMBERS('modelSet');
    const evalSet = await client.SMEMBERS('evalSet');

    const promises = [];
    modelSet.forEach(modelID => {
        promises.push(setOneModelEval(modelID, evalSet, client));
    })

    return Promise.all(promises).then(async (models) => {
        await client.quit();
        return models.map(model => { return { id: model.id, evals: model.evals } });
    })
}

const qidWithDocNos = async (data) => {//all data in redis, maybe we need a specific model version
    return readDataFromRedis().then(data => {
        const ret = [];
        data.forEach(model => {
            model.querys.forEach(query => {
                query.data.forEach(doc => {
                    ret.push({ topic_id: query.qid, page_id: '' + doc.docno });
                })
            })
        })
        return ret;
    })
}

const setOneModelPyEvals = async (modelID, client) => {
    const model = JSON.parse((await client.get(modelID)));
    const querys = JSON.parse((await client.get(model.querys)));

    const toPy = [];
    querys.forEach(query => {
        query.data.forEach(doc => {
            toPy.push({ topic_id: '101', page_id: '' + doc.docno });//Python eval script need topic_id to be a number
        })
    })


    return calcOneModelPy(toPy).then(data => {
        for(let k in data) 
            data[k] = data[k]['101'];//remove useless topic_id
        model.pyEval = data;
        return client.set(modelID, JSON.stringify(model)).then(() => data);
    })
}

// delAll()
// addToRedis();
module.exports = { readDataFromRedis, addOneModelDataToRedis, addEval, getEval, deleteOneModel, renameOneModel, setAllModelsEval, qidWithDocNos };