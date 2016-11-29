// Dependencies
const marked = require('marked')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')
const json2csv = require('json2csv')
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
// TODO add this later on
// app.use(cors({ origin: 'https://alberta.livingarchives.org' }))
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Fetches all statistics from the database
app.get('/statistics', (req, res, next) => {
    // CSV header fields
    const fields = ['id', 'guid', 'location', 'type', 'created']
    // Success (json and csv) & Error handlers
    const json = data => res.status(200).json({ message: 'success', data })
    const csv = data => res.status(200).type('csv').send(json2csv({ data, fields }))
    const e = err => next(err)
    // If the user request CSV or not
    const isCSV = req.query.format && req.query.format == 'csv' ? true : false

    if (req.query.type) {
        db.any('SELECT * FROM statistics WHERE type=${type}', req.query).then(isCSV ? csv : json).catch(e)
    } else {
        db.any('SELECT * FROM statistics').then(isCSV ? csv : json).catch(e)
    }
})

// Inserts one statistic into the database
app.post('/statistics', (req, res, next) => {
    // Request doesnt contain enough data
    if (!req.body.hasOwnProperty('guid')
        || !req.body.hasOwnProperty('location')
        || !req.body.hasOwnProperty('type')) {
        return res.status(400).json({ message: 'Bad request' })
    }

    db.any('SELECT guid FROM statistics WHERE guid=${guid} AND location=${location} AND type=${type}', req.body)
        .then(data => {
            console.log(data)

            if (data.length) {
                // Row already exsists
                res.status(202).json({ message: 'success' })
            } else {
                db.none('INSERT INTO statistics(guid, type, location, created) VALUES (${guid}, ${type}, ${location}, now())', req.body)
                    .then(() => res.status(201).json({ message: 'success' }))
                    .catch(err => next(err))
            }
        })
        .catch(err => next(err))
})

// Method of getting the ID from a filename (ex location_1.md)
const getID = f => Number(f.match(/\d+/)[0])

// Shouldnt be requested to often if client stores the data in localStorage (possible bottleneck)
app.get('/locations', (req, res, next) => {
    // Directory of content for each location
    const dir = `${__dirname}/locations`
    // Fetch meta data for each location
    fs.readFileAsync(`${dir}/locations.json`, 'utf8')
        .then(JSON.parse)
        // Fetch content for each location
        .then(json => (
            fs.readdirAsync(dir)
                .filter(filename => path.extname(filename) === '.md')
                .map(filename => (
                    fs.readFileAsync(`${dir}/${filename}`, 'utf8')
                        // Convert markdown to HTML and extract location ID from the filename
                        .then(fileContent => ({
                            id: getID(filename),
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
