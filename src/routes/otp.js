const express = require('express')
const { getOtp, verifyOtp } = require('../controllers/otpController')

const router = express.Router()

router.post('/sendOtp',getOtp)
router.post('/verifyOtp',verifyOtp)

module.exports = router