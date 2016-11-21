// Dependencies
const marked = require('marked')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const pgp = require('pg-promise')()

// Connection details for the database
const DB_USER = process.env.POSTGRES_USER
const DB_PASS = process.env.POSTGRES_PASSWORD
const DB_NAME = process.env.POSTGRES_DB
const db = pgp(`postgres://${DB_USER}:${DB_PASS}@postgres:5432/${DB_NAME}`)

// Logger and request body parser
app.use(morgan('combined'))
app.use(cors({ origin: ['https://alberta.livingarchives.org'] }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Fetches all statistics from the database
app.get('/statistics', (req, res, next) => {
    db.any('select * from statistics')
        .then(data => res.status(200).json({ message: 'success', data }))
        .catch(err => next(err))
})

// Inserts one statistic into the database
app.post('/statistics', (req, res, next) => {
    db.none('insert into statistics(guid, type, location, created) values (${guid}, ${type}, ${location}, now())', req.body)
        .then(() => res.status(201).json({ message: 'success' }))
        .catch(err => next(err))
})

// Shouldnt be requested to often if client stores the data in localStorage (possible bottleneck)
app.get('/locations', (req, res, next) => {
    // Directory of content for each location
    const dir = `${__dirname}/locations`
    // Fetch meta data for each location
    fs.readFileAsync('locations.json', 'utf8')
        .then(JSON.parse)
        // Fetch content for each location
        .then(json => (
            fs.readdirAsync(dir)
                .map(filename => (
                    fs.readFileAsync(`${dir}/${filename}`, 'utf8')
                        // Convert markdown to HTML and extract location ID from the filename
                        .then(fileContent => ({
                            id: Number(filename.split('.')[0].split('_')[1]),
                            html: marked(fileContent)
                        }))
                        .catch(err => next(err))
                ))
                .then(content => (
                    res.status(200).json({
                        message: 'success',
                        locations: json.locations,
                        content: content
                    })
                ))
                .catch(err => next(err))
        ))
        .catch(err => next(err))
})

// Error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ status: 'error', message: err.message })
})

// 404
app.use((req, res, next) => {
    res.status(404).json({ status: 'error', message: 'not found' })    
})

// Start listening for requests
app.listen(3001, () => console.log('[DATABASE SERVER] Started listening on port 3001'))
