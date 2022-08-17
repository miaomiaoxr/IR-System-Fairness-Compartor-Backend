const {
    readDataFromRedis,
    addOneModelDataToRedis,
    addEval,
    deleteOneModel,
    renameOneModel,
    setAllModelsEval,
    setOneModelPyEvals } = require('../models/redis');

describe('Test functions with redis', () => {
    test('Add a model to redis ,then delete', () => {
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

        let id = '';

        addOneModelDataToRedis(model).then(data => {
            expect(data.modelName).toBe(model.modelName);
            expect(data.querys.length).toBe(model.querys.length);
            expect(data).toHaveProperty('id');
            expect(data).toHaveProperty('ver');
            id = data.id;
            return;
        }).then(() => {
            return readDataFromRedis().then(data => {
                expect(data.length).toBeGreaterThan(0);
                expect(data.find(item => item.id === id)).toBeDefined();
            })
        }).then(() => {
            deleteOneModel(id).then(() => {
                return readDataFromRedis().then(data => {
                    expect(data.find(item => item.id === id)).toBeUndefined();
                }
                )
            }
            )
        })
    })
})