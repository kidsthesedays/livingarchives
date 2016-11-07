// Dependencies
const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')
const pgp = require('pg-promise')()

// Connection details for the database
const DB_USER = process.env.POSTGRES_USER
const DB_PASS = process.env.POSTGRES_PASSWORD
const DB_NAME = process.env.POSTGRES_DB
const db = pgp(`postgres://${DB_USER}:${DB_PASS}@postgres:5432/${DB_NAME}`)

// Logger and request body parser
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// TODO fix 404

// Fetches all statistics from the database
app.get('/statistics', (req, res, next) => {
    db.any('select * from statistics')
        .then(data => res.json({ status: 'success', data }))
        .catch(err => next(err))
})

// Inserts one statistic into the database
app.post('/statistics', (req, res, next) => {
    db.none('insert into statistics(guid, type, location, created) values (${guid}, ${type}, ${location}, now())', req.body)
        .then(() => res.json({ status: 'success' }))
        .catch(err => next(err))
})

// Error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ status: 'error', message: err.message })
})

// Start listening for requests
app.listen(3001, () => console.log('[DATABASE SERVER] Started listening on port 3001'))
