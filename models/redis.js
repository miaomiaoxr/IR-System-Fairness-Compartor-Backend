const redis = require('redis');
const { v4: uuidv4 } = require('uuid');

const clientInit = () => {
    return new Promise(async (resolve, reject) => {
        const client = redis.createClient({
            socket: { host: '192.168.37.128' }//JUST ON MY COMPUTER
        });

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

    let wroteModel = {...model};
    wroteModel.querys = dataID;
    await client.SADD('modelSet', id);
    await client.set(id, JSON.stringify(wroteModel));
   
    return model;
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


    await Promise.all(promises).then(models => {
        models.forEach(model => res.push(model));
    })
    await client.quit();

    return res;
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
    await client.set('eval', JSON.stringify(jsons));
    client.quit();
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

// delAll()
// addToRedis();
module.exports = { readDataFromRedis, addOneModelDataToRedis, addEval, getEval, deleteOneModel, renameOneModel };