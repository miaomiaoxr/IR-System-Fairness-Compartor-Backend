const redis = require('redis');

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
    const id = model.id;
    await client.SADD('modelSet', id);
    return client.set(id, JSON.stringify(model));

}

const readOneModel = async (modelID, client) => {
    return client.get(modelID).then(data => JSON.parse(data));
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
    await setOnefile(model, client).then(async () => {
        await client.quit();
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
    await client.SREM('modelSet', modelID);
    await client.del(modelID);
    await client.quit();
}

const renameOneModel = async (modelID,newName) => {
    const client = await clientInit();
    
    const data = JSON.parse((await client.get(modelID)));
    console.log(newName)
    data.modelName = newName;
    await client.set(modelID,JSON.stringify(data));

    await client.quit();
}

// delAll()
// addToRedis();
module.exports = { readDataFromRedis, addOneModelDataToRedis, addEval, getEval,deleteOneModel,renameOneModel };