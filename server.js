const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

const gamesAPI = require('./routes/api/games');

// parse application/json
app.use(bodyParser.json());

// Use routes
app.use('/api/games', gamesAPI);

// Error handling
app.use( (error, req, res, next) => {
    console.log(error);

    const statusCode = error.statusCode || 500;
    res.status(statusCode).send(error.message);
});

// Provide your address
const mongoAddr = '';

mongoose.connect(mongoAddr, { useNewUrlParser: true }).then(
    () => { console.log('Connection with MongoDB has been established...') }, 
    err => { console.log(err) });

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server has started on port ${port}.`);
});
