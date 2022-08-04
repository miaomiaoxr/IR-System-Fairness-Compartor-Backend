const { harmonicMean } = require('simple-statistics');

const genEvalForOneModel = (querys, evals) => {

    const evalsForOne = querys.reduce((prev, curr) => {
        const qid = curr.qid;

        const queryDocIDs = curr.data.map(doc => doc.docid);//change here if you want use docno instead of docid
        const evalData = evals.find(e => e.id == qid);

        if (evalData !== undefined) {
            prev[qid] = precisionAndRecallAndF1(queryDocIDs, evalData['rel_docs']);
        }

        return prev;
    }, {});

    console.log(evalsForOne);
    return evalsForOne;
}

const precisionAndRecallAndF1 = (queryDocIDs, evalDocIDs) => {
    let precision = 0;
    let recall = 0;
    let correct = 0;
    for (let i = 0; i < queryDocIDs.length; i++) {
        if (evalDocIDs.includes(queryDocIDs[i])) {
            correct++;
        }
    }
    precision = correct / queryDocIDs.length;
    recall = correct / evalDocIDs.length;
    const harmonicMeanValue = precision > 0 && recall > 0 ? harmonicMean([precision, recall]): -1;
    return {
        precision,
        recall,
        f1: harmonicMeanValue
    }
}

module.exports = { genEvalForOneModel }