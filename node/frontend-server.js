// Dependencies
const express = require('express')
const app = express()
const morgan = require('morgan')

// Logger
app.use(morgan('combined'))
// Send index.html on all requests
app.get('*', (req, res) => res.sendFile(__dirname + '/index.html'))

// Start listening for requests
app.listen(3000, () => console.log('[FRONTEND SERVER] Started listening on port 3000'))
