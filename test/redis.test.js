const {
    readDataFromRedis,
    addOneModelDataToRedis,
    addEval,
    getEval,
    deleteOneModel,
    renameOneModel,
    setAllModelsEval,
    qidWithDocNos,
    setOneModelPyEvals } = require('../models/redis');