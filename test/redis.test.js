const {
    readDataFromRedis,
    addOneModelDataToRedis,
    addEval,
    deleteOneModel,
    renameOneModel,
    setAllModelsEval, } = require('../models/redis');

describe('Test functions with redis', () => {
    test('Test the entire life cycle of a model, from input to delete', async () => {
        const task1Model = {
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

        const task2Model =
        {
            "modelName": "testModelTask2",
            "querys": [
                {
                    "qid": "101",
                    "query": "mathematician arithmetician trigonometrician geometer algebraist statistician geometrician number theorist",
                    "data": [
                        {
                            "seq_id": 1,
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
                            "seq_id": 1,
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
                        {
                            "seq_id": 1,
                            "docid": 3378444,
                            "docno": 30714123,
                            "rank": 2,
                            "score": 26.31464931,
                            "gender": [
                                "male"
                            ],
                            "quality_scores": 0.019582337,
                            "geographic_locations": [

                            ]
                        },
                        {
                            "seq_id": 1,
                            "docid": 1322683,
                            "docno": 7969592,
                            "rank": 3,
                            "score": 22.85107123,
                            "gender": [

                            ],
                            "quality_scores": 0.8381386,
                            "geographic_locations": [

                            ]
                        },]
                }],
                'ver': 'task2'
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

        let task1id = '';
        let task2id = '';

        await addOneModelDataToRedis(task1Model).then(data => {//first add this model into redis
            expect(data.modelName).toBe(task1Model.modelName);
            expect(data.querys.length).toBe(task1Model.querys.length);
            expect(data).toHaveProperty('id');
            expect(data).toHaveProperty('ver');
            task1id = data.id;
            return;
        })

        await addOneModelDataToRedis(task2Model).then(data => {//add task2 model into redis
            expect(data.modelName).toBe(task2Model.modelName);
            expect(data.querys.length).toBe(task2Model.querys.length);
            expect(data).toHaveProperty('id');
            expect(data).toHaveProperty('ver');
            task2id = data.id;
            return;
        })

        await readDataFromRedis().then(data => {//ensure the model is in redis
            expect(data.length).toBeGreaterThan(0);
            expect(data.find(item => item.id === task1id)).toBeDefined();
        })

        await addEval(evalData);
        await setAllModelsEval();
        await readDataFromRedis().then(data => {
            expect(data.find(item => item.id === task1id).evals).toBeDefined();
        })
        await renameOneModel(task1id, 'testNewName').then(() => {
            return readDataFromRedis().then(data => {
                expect(data.find(item => item.id === task1id).modelName).toBe('testNewName');
                return data;
            })
        })

        await deleteOneModel(task2id).then(() => {
            return readDataFromRedis().then(data => {
                expect(data.find(item => item.id === task2id)).toBeUndefined();
            }
            )
        }
        )

        return deleteOneModel(task1id).then(() => {
            return readDataFromRedis().then(data => {
                expect(data.find(item => item.id === task1id)).toBeUndefined();
            }
            )
        }
        )

    })

})