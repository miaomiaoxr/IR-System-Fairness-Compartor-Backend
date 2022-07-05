const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { readData } = require('./models/async_data');
const { readDataFromRedis } = require('./models/redis');

const app = express();
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :JSON'));//request logger
app.use(cors());//enable cors

morgan.token('JSON', (request, response) => {
  if (request.method !== 'POST') return ""
  return JSON.stringify(request.body)
})// add a new token to the morgan logger

app.get('/', (req, res) => {
  // readData().then(data=>res.json(data));
  readDataFromRedis().then(data => res.json(data));
});

app.get('/api/models', (req, res) => {
  // readData((data) => {
  //   res.json(data);
  // })
  // readData().then(data=>res.json(data));
  readDataFromRedis().then(data => res.json(data));
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
