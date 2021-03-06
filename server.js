const express = require('express');
const PORT = 3001;
require('dotenv').config()
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcryptjs');

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'davesersch',
    //   password : process.env.DB_PASS,
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
    console.log(date.getMonth())
    res.send(date)
})

app.post('/register', (req, res) => {
    const { email, password } = req.body;
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            db('users').returning('*').insert({
                email: email,
                password: hash
            }).then(result => {
                res.json({message: 'success', result: result[0].userid})
            }).catch(err => res.status(400).json({message: 'user already exists...'}))
        });
    });
})

app.post('/signin', (req, res) => {
    db('users').returning('*').where('email', req.body.signInEmail)
    .then(result => {
        const hash = result[0].password
        bcrypt.compare(req.body.signInPassword, hash, function(err, response)  {
            response ? 
                res.json({message: 'success', result: result[0].userid}) 
                : res.json({message: 'failed'})
        })
    }).catch((err) => res.status(400).json({message: 'you messed up...'}))
})

app.post('/home', (req, res) => {
    let date = new Date();
    date.setDate(date.getDate() - 7);

    db('tests').returning('*').where('userid', req.body.userid)
    .andWhere('time', '>', date)
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