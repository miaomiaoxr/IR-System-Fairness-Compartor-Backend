const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));//request logger
app.use(cors());//enable cors


app.get('/', (req, res) => {
    res.send('Hello World!');
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
