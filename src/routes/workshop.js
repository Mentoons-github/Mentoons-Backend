const express = require('express')
const { submitWorkshopForm } = require('../controllers/workshopController')

const router = express.Router()

router
  .route('/submit-form')
  .post(submitWorkshopForm)

module.exports = router