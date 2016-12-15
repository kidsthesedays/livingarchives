// Dependencies
const express = require('express')
const app = express()
const morgan = require('morgan')
const jwt = require('jsonwebtoken')
const crypt = require('crypto')

const JWT_SECRET = process.env.NODE_JWT_SECRET

// Logger
app.use(morgan('combined'))

// Send index.html on all requests
app.get('*', (req, res) => {
    const token = jwt.sign({ s: crypt.randomBytes(64).toString('hex')}, JWT_SECRET)
    res.cookie('access_token', token, { domain: '.livingarchives.org', httpOnly: true, secure: true, maxAge: 1000 * 60 * 60 * 24 * 7 }).sendFile(__dirname + '/index.html')
})

// Start listening for requests
app.listen(3000, () => console.log('[FRONTEND SERVER] Started listening on port 3000'))
