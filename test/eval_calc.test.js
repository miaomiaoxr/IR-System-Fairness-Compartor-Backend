const { genEvalForOneModel } = require('../models/eval_calc.js');



test('Eval for one model(Presicion, Recall and F1', () => {
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
        ]
    }]

    const evalData = [
        {
            "id": 101,
            "title": "Mathematicians",
            "rel_docs": [
                15807,
                41999,
                49731,
                61636,
                11254442,
            ]
        }
    ]

    const res = genEvalForOneModel(querys, evalData);
    res.f1 = Number(res.f1);

    expect(res).toEqual({
        '101': {
            'precision':0.5,
            'recall': 0.2,
        },
        "f1": expect.closeTo(0.28,1)//"0.28571"
    }
    );
})