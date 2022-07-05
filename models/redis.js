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
    const modelName = model.model;
    return client.exists(modelName).then(async (exists) => {
        if (!exists) {
            await client.SADD('modelSet', modelName);
            return client.set(modelName, JSON.stringify(model));//return a promise
        } else {
            throw new Error(`${modelName} already exists`);//catch in express
        }
    })
}

const readOneModel = async (modelName, client) => {
    return client.get(modelName).then(data => JSON.parse(data));
}

const readDataFromRedis = async () => {
    const client = await clientInit();
    const models = await client.SMEMBERS('modelSet');
    if (models.length === 0) return [];

    const promises = [];
    models.forEach(model => promises.push(readOneModel(model, client)));

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

//should export this one also
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

    // console.log(await client.ping())
    // console.log(await client.set("name", "John"));
    // console.log(await client.GET("name"));
    // console.log(await client.del("name"));
    // console.log(await client.quit());
};

const delAll = async () => {
    const client = await clientInit();
    const promises = [];
    const keys = await client.keys('*')

    keys.forEach(key => promises.push(client.del(key)))
    await Promise.all(promises).then(async () => {
        await client.quit();
    })
}


// delAll()
// addToRedis();
module.exports = { readDataFromRedis };