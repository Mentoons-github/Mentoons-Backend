const express = require("express")
const cors = require('cors')
const dbConnection = require("./src/config/dbConfig");
const errorHandler = require("./src/middlewares/errorHandler");
const emailRoutes = require('./src/routes/email')


const app = express()
const PORT = process.env.PORT || 4000


app.use(express.json())
app.use(cors())
app.use('/email', emailRoutes)

app.use('*', (req, res, next) => {
    const url = req.originalUrl
    res.json({
        message: `${url} is not a valid endpoint`,
    })
})


app.use(errorHandler)


dbConnection()


app.listen(PORT, () => {
    console.log(`server running in http://localhost:${PORT}`)
})