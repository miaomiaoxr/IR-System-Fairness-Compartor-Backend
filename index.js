const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const { processFile, processEval } = require('./models/async_data');
const { readDataFromRedis, deleteOneModel, renameOneModel} = require('./models/redis');
const multer = require('multer');

const CSVstorage = multer.diskStorage({
  destination: path.join(__dirname, 'csvs'),
  filename: function (req, file, cb) {
    cb(
      null,
      file.originalname
    );
  },
});

const evalStorage = multer.diskStorage({
  destination: path.join(__dirname, 'eval'),
  filename: function (req, file, cb) {
    cb(
      null,
      file.originalname
    );
  },
});

const CSVupload = multer({
  storage: CSVstorage,
  limits: { fileSize: 10000000000 }
});

const evalUpload = multer({
  storage: evalStorage,
  limits: { fileSize: 10000000000 }
});

const app = express();
// app.use(express.static('build'))
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :JSON'));//request logger
app.use(cors());//enable cors

morgan.token('JSON', (request, response) => {
  if (request.method !== 'POST') return ""
  return JSON.stringify(request.body)
})// add a new token to the morgan logger

app.get('/', (req, res) => {
  readDataFromRedis().then(data => res.json(data));
});

app.get('/api/models', (req, res) => {
  readDataFromRedis().then(data => res.json(data));
});


app.post('/api/models', CSVupload.single('model_file'), (req, res) => {
  processFile(req.file.filename).then(json => {
    res.json(json)
  });//sure works
});

app.post('/api/eval', evalUpload.single('eval_file'), (req, res) => {
  processEval(req.file.filename).then((modelsWithEval) => {
    res.json(modelsWithEval)
  }
  );
});

app.delete('/api/models/:id', (req, res) => {
  const { id } = req.params;
  deleteOneModel(id).then(() => {
    res.json();
  });
});

app.put('/api/models/:id', (req, res) => {
  const { id } = req.params;
  const newName = req.body.newName;
  renameOneModel(id, newName).then(() => {
    res.json();
  })
});



app.use((error, req, res, next) => {
  console.log('Path: ', req.path)
  console.error('Error: ', error)

  // if (error.type == 'redirect')
  //   res.redirect('/error')

  // else if (error.type == 'time-out') // arbitrary condition check
  //   res.status(408).send(error)
  // else
  //   res.status(500).send(error)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
