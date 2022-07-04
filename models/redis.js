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
    return await client.exists(modelName).then(async (exists) => {
        if (!exists) {
            return await client.set(modelName, JSON.stringify(model));
        } else {
            throw new Error(`${modelName} already exists`);//catch in express
        }
    })
}

const readDataFromRedis = async () => {
    const client = await clientInit();
    const res = [];
    // return await client.get('mock_data', async (err, data) => {//READ mock_data ONLY
    //     console.log(JSON.parse(data));
    //     await client.quit();

    //     res.push(JSON.parse(data));
    //     return res;
    // })
    return await client.get('mock_data').then(async (data) => {//READ mock_data ONLY
        console.log(JSON.parse(data));
        await client.quit();

        res.push(JSON.parse(data));
        return res;
    })
}

//should export this one also
const addToRedis = async () => {
    const client = await clientInit();

    const models = await readData();

    const promises = [];


    models.forEach(model => {
        promises.push(setOnefile(model, client));
    })

    Promise.all(promises).then(async () => {
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

module.exports = { readDataFromRedis };