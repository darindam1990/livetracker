const express = require('express');
const bodyParser = require('body-parser');
const dataFile = require("./data/fe-challenge-input.json");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/static', express.static('../public'))
app.use('/tests/spec', express.static('./spec'))

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: '../public'});
});

app.get('/test', (req, res) => {
    res.sendFile('spec/index.html', {root: './'});
});

app.get('/data', (req, res) => {
    res.json(dataFile);
});
app.listen(process.env.PORT || 9001)