const express = require('express')
const { subscribeNewsletter, freeDownloads } = require('../controllers/emailController')

const router = express.Router()

router.post('/sendNewsLetter',subscribeNewsletter)
router.post('/freeDownloads',freeDownloads)


module.exports = router; 