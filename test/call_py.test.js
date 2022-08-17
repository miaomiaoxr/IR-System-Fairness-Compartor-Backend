const { calcOneModel } = require('../models/call_py');

describe('Test Eval work with py', () => {
    test('Eval combined with py script(Task1)', () => {
        const querys = [{
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
                {
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
        },
        {
            "qid": "102",
            "query": "disco discotheque nightclub deejay dj remix dance music",
            "data": [
                {
                    "docid": 3658370,
                    "docno": 33942463,
                    "rank": 0,
                    "score": 40.10586,
                    "gender": [

                    ],
                    "quality_scores": 0.37024763,
                    "geographic_locations": [

                    ]
                },
                {
                    "docid": 6194380,
                    "docno": 66067558,
                    "rank": 1,
                    "score": 40.07042059,
                    "gender": [
                        "male"
                    ],
                    "quality_scores": 0.46975353,
                    "geographic_locations": [

                    ]
                },
                {
                    "docid": 4660861,
                    "docno": 45286543,
                    "rank": 2,
                    "score": 39.29795686,
                    "gender": [
                        "male"
                    ],
                    "quality_scores": 0.28667355,
                    "geographic_locations": [
                        "Northern America"
                    ]
                },
                {
                    "docid": 3563823,
                    "docno": 32872975,
                    "rank": 3,
                    "score": 35.75216491,
                    "gender": [
                        "male"
                    ],
                    "quality_scores": 0.4398649,
                    "geographic_locations": [
                        "Northern America"
                    ]
                },
                {
                    "docid": 5072406,
                    "docno": 51042708,
                    "rank": 4,
                    "score": 33.91203551,
                    "gender": [
                        "female"
                    ],
                    "quality_scores": 0.35269594,
                    "geographic_locations": [

                    ]
                },
                {
                    "docid": 5528086,
                    "docno": 57001746,
                    "rank": 5,
                    "score": 33.18979487,
                    "gender": [
                        "male"
                    ],
                    "quality_scores": 0.22954425,
                    "geographic_locations": [

                    ]
                },
                {
                    "docid": 4978978,
                    "docno": 49687202,
                    "rank": 6,
                    "score": 32.78464027,
                    "gender": [

                    ],
                    "quality_scores": 0.19701697,
                    "geographic_locations": [

                    ]
                },
                {
                    "docid": 3428964,
                    "docno": 31286293,
                    "rank": 7,
                    "score": 32.55056645,
                    "gender": [

                    ],
                    "quality_scores": 0.29755238,
                    "geographic_locations": [

                    ]
                },
                {
                    "docid": 165084,
                    "docno": 383969,
                    "rank": 8,
                    "score": 32.35264395,
                    "gender": [

                    ],
                    "quality_scores": 0.5100253,
                    "geographic_locations": [
                        "Northern America"
                    ]
                },
                {
                    "docid": 734442,
                    "docno": 3138742,
                    "rank": 9,
                    "score": 32.10823838,
                    "gender": [

                    ],
                    "quality_scores": 0.35344425,
                    "geographic_locations": [
                        "Northern America"
                    ]
                },
                {
                    "docid": 3954826,
                    "docno": 37353630,
                    "rank": 10,
                    "score": 31.98574794,
                    "gender": [
                        "female"
                    ],
                    "quality_scores": 0.5152492,
                    "geographic_locations": [
                        "Northern America"
                    ]
                },
                {
                    "docid": 3032306,
                    "docno": 26493081,
                    "rank": 11,
                    "score": 31.42921615,
                    "gender": [

                    ],
                    "quality_scores": 0.31774575,
                    "geographic_locations": [

                    ]
                },
                {
                    "docid": 3659,
                    "docno": 7966,
                    "rank": 12,
                    "score": 30.77897844,
                    "gender": [

                    ],
                    "quality_scores": 0.909,
                    "geographic_locations": [

                    ]
                }
            ]
        },
        {
            "qid": "103",
            "query": "european writer novelist author fiction essayist playwright dramatist wordsmith",
            "data": [
                {
                    "docid": 4648452,
                    "docno": 45099236,
                    "rank": 0,
                    "score": 40.80284046,
                    "gender": [

                    ],
                    "quality_scores": 0.3427779,
                    "geographic_locations": [

                    ]
                },
                {
                    "docid": 4282221,
                    "docno": 41029852,
                    "rank": 1,
                    "score": 38.871925,
                    "gender": [

                    ],
                    "quality_scores": 0.39904982,
                    "geographic_locations": [

                    ]
                },
                {
                    "docid": 4701147,
                    "docno": 46195237,
                    "rank": 2,
                    "score": 38.66363786,
                    "gender": [

                    ],
                    "quality_scores": 0.24074435,
                    "geographic_locations": [

                    ]
                },]
        }
        ]
        const toPy = [];
        querys.forEach(query => {
            query.data.forEach(doc =>
                toPy.push({ topic_id: '101', page_id: '' + doc.docno })
            )
        })

        return calcOneModel(toPy, 1).then(data => {
            return expect(data).toEqual({ "AWRF": { "101": expect.closeTo(0.66, 1) }, "Score": { "101": expect.closeTo(0.02, 1) }, "nDCG": { "101": expect.closeTo(0.03, 1) } });
        });
    })



    test('Eval combined with py script(Task2)', () => {
        const querys = [
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
                    },
                    {
                        "seq_id": 1,
                        "docid": 2184082,
                        "docno": 17483851,
                        "rank": 4,
                        "score": 22.4752814,
                        "gender": [
                            "male"
                        ],
                        "quality_scores": 0.25009447,
                        "geographic_locations": [

                        ]
                    },]
            }
        ];

        const toPy = [];
        querys.forEach(query => {
            query.data.forEach(doc =>
                toPy.push({ topic_id: '101', seq_no: doc.seq_id, page_id: '' + doc.docno })
            )
        })

        return calcOneModel(toPy, 2).then(data => {
            return expect(data).toEqual({ "EE-D": { "101": expect.closeTo(7.37, 1) }, "EE-L": { "101": expect.closeTo(15.57, 1) }, "EE-R": { "101": expect.closeTo(5.21, 1) } });
        });
    })
})