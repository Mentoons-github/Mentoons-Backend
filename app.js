const express = require("express")
const cors = require('cors')
const dbConnection = require("./src/config/dbConfig");
const errorHandler = require("./src/middlewares/errorHandler");
const emailRoutes = require('./src/routes/email')
const productRoutes = require('./src/routes/products');
const otpRoutes = require('./src/routes/otp');


const app = express()
const PORT = process.env.PORT || 4000


app.use(express.json())
app.use(cors())
app.use('/api/v1/email', emailRoutes)
app.use('/api/v1/products',productRoutes)
app.use('/api/v1/otp',otpRoutes)

app.use('*', (req, res, next) => {
    const url = req.originalUrl
    res.json({
        message: `${url} is not a valid endpoint`,
    })
})

app.use(errorHandler)

dbConnection()


app.listen(PORT, async() => {
    console.log(`server running in http://localhost:${PORT}`)
})