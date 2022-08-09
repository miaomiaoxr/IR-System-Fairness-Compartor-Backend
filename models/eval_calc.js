const { harmonicMean } = require('simple-statistics');

const genEvalForOneModel = (querys, evals) => {
    let precisionAndRecalls = [];

    const evalsForOne = querys.reduce((prev, curr) => {
        const qid = curr.qid;

        // const queryDocIDs = curr.data.map(doc => doc.docid);//change here if you want use docno instead of docid
        const queryDocIDs = curr.data.map(doc => doc.docno);//change here if you want use docno instead of docid
        const evalData = evals.find(e => e.id == qid);

        if (evalData !== undefined) {
            prev[qid] = precisionAndRecallAndF1(queryDocIDs, evalData['rel_docs']);
            precisionAndRecalls.push(prev[qid].precision, prev[qid].recall);
        }

        return prev;
    }, {});
    
    precisionAndRecalls = precisionAndRecalls.filter(e => e > 0);
    if(precisionAndRecalls.length > 0) evalsForOne['f1'] = harmonicMean(precisionAndRecalls).toFixed(5);
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
    
    return {
        precision,
        recall,
    }
}

module.exports = { genEvalForOneModel }