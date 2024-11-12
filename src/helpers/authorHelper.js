const Author = require("../models/authorModel")

module.exports = {
    addAuthorToDB: async (name, image) => {
     try {
        const authorData = await Author.create({ name, image })
        return authorData
     } catch (error) {
        throw new Error(error.message)
     }   
    },
    getAllAuthorsFromDB: async () => {
        try {
            const authorData = await Author.find()
            return authorData
        } catch (error) {
            throw new Error(error.message)
        }
    }
}