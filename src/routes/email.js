const express = require('express')
const { subscribeNewsletter, getLeadData, freeDownloadsRequest, freeDownloadsVerifyOtp } = require('../controllers/emailController')
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router()

router.post('/subscribeToNewsletter',subscribeNewsletter)
router.post('/freeDownloadsReq',freeDownloadsRequest)
router.post('/freeDownloadsVerify',freeDownloadsVerifyOtp)
router.get('/getLeadData',authMiddleware,getLeadData)


module.exports = router; 