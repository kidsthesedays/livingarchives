// Dependencies
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

// TODO add more urls
const whitelist = ['https://alberta.livingarchives.org']
const corsOptions = {
    credentials: true,
    origin: (origin, cb) => {
        if (whitelist.indexOf(origin) !== -1) {
            return cb(null, true)
        }
        return cb(new Error('Not allowed by CORS'))
    }
}

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

// Helper method for fetching statistics from table `t`
const getStats = t => (req, res, next) => {
    // CSV header fields
    const fields = ['id', 'guid', 'location', 'type', 'created']

    // Success (json and csv) & Error handlers
    const json = data => res.status(200).json({ message: 'success', data })
    const csv = data => res.status(200).type('csv').send(json2csv({ data, fields }))

    // If the user request CSV or not
    const isCSV = req.query.format && req.query.format == 'csv' ? true : false

    if (req.query.type) {
        db.any(`SELECT * FROM ${t} WHERE type=$\{type}`, req.query)
            .then(isCSV ? csv : json)
            .catch(err => next(err))
    } else {
        db.any(`SELECT * FROM ${t}`)
            .then(isCSV ? csv : json)
            .catch(err => next(err))
    }
}

// Helper method for sending statistics to table `t`
const postStats = t => (req, res, next) => {
    // Request doesnt contain enough data
    if (!'guid' in req.body || !'location' in req.body || !'type' in req.body) {
        return res.status(400).json({ message: 'Bad request' })
    }

    db.any(`SELECT guid FROM ${t} WHERE guid=$\{guid} AND location=$\{location} AND type=$\{type}`, req.body)
        .then(data => {
            // Row already exsists
            if (data.length) {
                return res.status(202).json({ message: 'success' })
            }

            db.none(`INSERT INTO ${t}(guid, type, location, created) VALUES ($\{guid}, $\{type}, $\{location}, now())`, req.body)
                .then(() => res.status(201).json({ message: 'success' }))
                .catch(err => next(err))
        })
        .catch(err => next(err))
}

// Enable OPTIONS for each project
app.options('/statistics-fa', cors())
app.options('/statistics-bs', cors())

// Fetches all statistics from the database
app.get('/statistics-fa', auth.connect(basicAuth), getStats('statisticsFindingAlberta'))
app.get('/statistics-bs', auth.connect(basicAuth), getStats('statisticsBitterAndSweet'))

// Inserts one statistic into the database
app.post('/statistics-fa', cors(corsOptions), cookieJWT, postStats('statisticsFindingAlberta'))
app.post('/statistics-bs', cors(corsOptions), cookieJWT, postStats('statisticsBitterAndSweet'))

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
app.listen(3000, () => console.log('[DATABASE SERVER] Started listening on port 3000'))
