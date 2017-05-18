// Dependencies
const express = require('express')
const app = express()
const morgan = require('morgan')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const crypt = require('crypto')
const marked = require('marked')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')

const JWT_SECRET = process.env.NODE_JWT_SECRET

// Logger
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Send index.html on all requests
app.get('/', (req, res) => {
    const token = jwt.sign({ s: crypt.randomBytes(64).toString('hex') }, JWT_SECRET)

    const cookieOptions = {
        domain: '.livingarchives.org',
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 
    }

    res.cookie('access_token', token, cookieOptions).sendFile(__dirname + '/index.html')
})

// Method of getting the ID from a filename (ex location_1.md)
const getID = f => Number(f.match(/\d+/)[0])

// Shouldnt be requested to often if client stores the
// data in localStorage (possible bottleneck)
app.get('/locations', (req, res, next) => {
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
app.listen(3002, () => console.log('[SERVER: Bitter and Sweet] Started listening on port 3002'))
