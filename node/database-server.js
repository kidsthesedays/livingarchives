// Dependencies
const marked = require('marked')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')
const json2csv = require('json2csv')
const auth = require('http-auth')
const jwt = require('express-jwt')
const cookieParser = require('cookie-parser')
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

// ENV variables
const DEBUG = process.env.NODE_DEBUG
const HTTP_AUTH_USER = process.env.NODE_HTTP_AUTH_USER
const HTTP_AUTH_PASS = process.env.NODE_HTTP_AUTH_PASS
const JWT_SECRET = process.env.NODE_JWT_SECRET

// Logger and request body parser
app.use(morgan('combined'))
app.use(cookieParser())
// TODO add origins to a ENV var perhaps? they are needed due to credentials = true
// app.use(DEBUG ? cors({ credentials: true }) : cors({ origin: 'https://alberta.livingarchives.org', credentials: true }))
app.use(cors({ origin: 'https://alberta.livingarchives.org', credentials: true }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// HTTP basic auth handler
const basicAuth = auth.basic(
    { realm: 'Living Archives.' },
    (user, pass, cb) => cb(user == HTTP_AUTH_USER && pass == HTTP_AUTH_PASS)
)
// Cookie + JWT auth handler
const cookieJWT = jwt({
    secret: JWT_SECRET,
    getToken: req => req.cookies.access_token ? req.cookies.access_token : null 
})

// Fetches all statistics from the database
app.get('/statistics', auth.connect(basicAuth), (req, res, next) => {
    // CSV header fields
    const fields = ['id', 'guid', 'location', 'type', 'created']
    // Success (json and csv) & Error handlers
    const json = data => res.status(200).json({ message: 'success', data })
    const csv = data => res.status(200).type('csv').send(json2csv({ data, fields }))
    const e = err => next(err)
    // If the user request CSV or not
    const isCSV = req.query.format && req.query.format == 'csv' ? true : false

    // TODO error handling
    if (req.query.type) {
        db.any('SELECT * FROM statistics WHERE type=${type}', req.query).then(isCSV ? csv : json).catch(e)
    } else {
        db.any('SELECT * FROM statistics').then(isCSV ? csv : json).catch(e)
    }
})

app.options('/statistics', cors())
// Inserts one statistic into the database
app.post('/statistics', cookieJWT, (req, res, next) => {
    // Request doesnt contain enough data
    if (!'guid' in req.body || !'location' in req.body || !'type' in req.body) {
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

app.options('/locations', cors())

// Shouldnt be requested to often if client stores the data in localStorage (possible bottleneck)
app.get('/locations', cookieJWT, (req, res, next) => {
    // Directory of content for each location
    const dir = `${__dirname}/locations`
    // Fetch meta data for each location
    fs.readFileAsync(`${dir}/locations.json`, 'utf8')
        .then(JSON.parse)
        // Fetch content for each location
        .then(json => (
            fs.readdirAsync(dir)
                // Filter out markdown files
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
    const msg = err.message ? err.message : 'Internal server error'
    res.status(err.status || 500).json({ message: msg })
})

// 404
app.use((req, res, next) => {
    res.status(404).json({ message: 'Page not found' })    
})

// Start listening for requests
app.listen(3001, () => console.log('[DATABASE SERVER] Started listening on port 3001'))
