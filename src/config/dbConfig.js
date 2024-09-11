require('dotenv').config();
const mongoose = require('mongoose');


function dbConnection (){
    mongoose.connect(process.env.DB_URI)
    .then(() => {
        console.log('db connected successfully');
    })
    .catch((err) => {
        console.log('Error connecting to the database:', err);
    });

}

module.exports = dbConnection