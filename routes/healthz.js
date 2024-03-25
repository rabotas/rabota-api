const express = require('express')
const router = express.Router()


/* GET healthz */
router.get('/', async (req, res) => {
  res.status(200).json({ status: "success", message: "Service is up and running." })
})

module.exports = router
