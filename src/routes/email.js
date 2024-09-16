const express = require('express')
const { subscribeNewsletter, getLeadData, freeDownloadsRequest, freeDownloadsVerifyOtp } = require('../controllers/emailController')

const router = express.Router()

router.post('/subscribeToNewsletter',subscribeNewsletter)
router.post('/freeDownloadsReq',freeDownloadsRequest)
router.post('/freeDownloadsVerify',freeDownloadsVerifyOtp)
router.get('/getLeadData',getLeadData)


module.exports = router; 