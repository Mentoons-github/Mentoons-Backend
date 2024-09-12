const express = require('express')
const { subscribeNewsletter, freeDownloads, getLeadData } = require('../controllers/emailController')

const router = express.Router()

router.post('/subscribeToNewsletter',subscribeNewsletter)
router.post('/freeDownloads',freeDownloads)
router.get('/getLeadData',getLeadData)


module.exports = router; 