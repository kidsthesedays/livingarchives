const express = require('express')
const app = express()
const morgan = require('morgan')
// const bodyParser = require('body-parser')

app.use(morgan('combined'))
// app.use(bodyParser.json())

app.get('/', (req, res) => res.send('frontend'))

app.listen(3000, () => console.log('[FRONTEND SERVER] Started listening on port 3000'))
