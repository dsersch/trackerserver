const express = require('express');
const PORT = 3001;
require('dotenv').config()
const cors = require('cors');
const knex = require('knex');

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : process.env.DB_PASS,
      database : 'sugartest'
    }
  });

const app = express();


app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors())

app.get('/', (req, res) => {
    let date = new Date();
    date.setDate(date.getDate() - 5)
    res.send(date)
})

app.post('/home', (req, res) => {
    db('tests').returning('*').where('userid', req.body.userid)
    .orderBy('time', 'desc').limit(7)
    .then(results => {
        res.json(results)
    })
})

app.post('/addTest', (req, res) => {
    const { userid, sugar, fasting, notes } = req.body;
    db('tests').returning('*').insert({
        userid: userid,
        sugar: sugar,
        fasting: fasting,
        notes: notes
    }).then(test => {
        res.json(test[0])
    })
})

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}...`)
})