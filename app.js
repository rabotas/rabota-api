const express = require('express')
const cors = require('cors')
const pino = require('pino')
const path = require('path')
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
})

const app = express()

app.use(cors())
app.use(express.json())

app.use(express.static(path.join(__dirname, 'public')))

/* GET routes */

app.use('/healthz', require('./routes/healthz'))
app.use('/', require('./routes/payload'))

/* ---------- */



/* POST routes */



/* ---------- */



/* Other routes */



/* ---------- */

const PORT = process.env.PORT || 3000
app.listen(PORT, () => logger.info(`API is up and running on port ${PORT}`))
