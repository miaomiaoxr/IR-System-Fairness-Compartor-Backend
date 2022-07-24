const redis = require('redis');
const { readData } = require('./async_data.js');

const clientInit = () => {
    return new Promise(async (resolve, reject) => {
        const client = redis.createClient({
            socket: { host: '192.168.37.128' }
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


    // return client.exists(modelName).then(async (exists) => {
    //     if (!exists) {
    //         await client.SADD('modelSet', modelName);
    //         return client.set(modelName, JSON.stringify(model));//return a promise
    //     } else {
    //         throw new Error(`${modelName} already exists`);//catch in express
    //     }
    // })
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
    // return await client.get('mock_data', async (err, data) => {//READ mock_data ONLY
    //     console.log(JSON.parse(data));
    //     await client.quit();

    //     res.push(JSON.parse(data));
    //     return res;
    // })

    await Promise.all(promises).then(models => {
        models.forEach(model => res.push(model));
    })
    await client.quit();
    // return client.get('mock_data').then(async (data) => {//READ mock_data ONLY
    //     console.log(JSON.parse(data));
    //     await client.quit();

    //     res.push(JSON.parse(data));
    //     return res;//return a promise
    // })
    return res;
}

const addOneModelDataToRedis = async (model) => {
    const client = await clientInit();
    await setOnefile(model, client).then(async () => {
        await client.quit();
    }
    );
}

//only for test
const addToRedis = async () => {
    const client = await clientInit();

    const models = await readData();

    const promises = [];


    models.forEach(model => {
        promises.push(setOnefile(model, client));
    })

    await Promise.all(promises).then(async () => {
        await client.quit();
        return;
    }
    );

};

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

// delAll()
// addToRedis();
module.exports = { readDataFromRedis, addOneModelDataToRedis, addEval, getEval,deleteOneModel };