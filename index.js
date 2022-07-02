const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const fs = require('fs');
// const { data } = require('./models/data');
const { readData } = require('./models/async_data');

const app = express();
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :JSON'));//request logger
app.use(cors());//enable cors

morgan.token('JSON', (request, response) => {
  if (request.method !== 'POST') return ""
  return JSON.stringify(request.body)
})// add a new token to the morgan logger

app.get('/', (req, res) => {
  readData((data) => {
    res.json(data);
  })
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
