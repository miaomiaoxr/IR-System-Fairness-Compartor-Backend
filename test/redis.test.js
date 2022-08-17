const {
    readDataFromRedis,
    addOneModelDataToRedis,
    addEval,
    deleteOneModel,
    renameOneModel,
    setAllModelsEval,
    setOneModelPyEvals } = require('../models/redis');

describe('Test functions with redis', () => {
    test('Add a model to redis ,then delete', async () => {
        const model = {
            modelName: 'testModel',
            querys: [
                {
                    "qid": "101",
                    "query": "mathematician arithmetician trigonometrician geometer algebraist statistician geometrician number theorist",
                    "data": [
                        {
                            "docid": 1600262,
                            "docno": 11254442,
                            "rank": 0,
                            "score": 35.34736647,
                            "gender": [

                            ],
                            "quality_scores": 0.6128112,
                            "geographic_locations": [

                            ]
                        },
                        {
                            "docid": 38196,
                            "docno": 80143,
                            "rank": 1,
                            "score": 29.20895383,
                            "gender": [

                            ],
                            "quality_scores": 0.151892,
                            "geographic_locations": [

                            ]
                        },
                    ]
                }],
            ver: 'task1'
        }

        const evalData = [
            {
                "id": 101,
                "title": "Mathematicians",
                "rel_docs": [
                    15807,
                    41999,
                    49731,
                    61636,
                    11254442
                ]
            }
        ]

        let id = '';

        await addOneModelDataToRedis(model).then(data => {//first add this model into redis
            expect(data.modelName).toBe(model.modelName);
            expect(data.querys.length).toBe(model.querys.length);
            expect(data).toHaveProperty('id');
            expect(data).toHaveProperty('ver');
            id = data.id;
            return;
        })

        await readDataFromRedis().then(data => {//ensure the model is in redis
            expect(data.length).toBeGreaterThan(0);
            expect(data.find(item => item.id === id)).toBeDefined();
        })

        await addEval(evalData);
        await setAllModelsEval();
        await readDataFromRedis().then(data => {
            expect(data.find(item => item.id === id).evals).toBeDefined();
        })
        await renameOneModel(id, 'testNewName').then(() => {
            return readDataFromRedis().then(data => {
                expect(data.find(item => item.id === id).modelName).toBe('testNewName');
                return data;
            })
        })

        return deleteOneModel(id).then(() => {
            return readDataFromRedis().then(data => {
                expect(data.find(item => item.id === id)).toBeUndefined();
            }
            )
        }
        )

    })

})