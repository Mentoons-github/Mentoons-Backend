const Quiz = require("../models/quiz")

module.exports = {
    saveQuiztoDB: async (quizCategory,
        quizDifficulty,
        subCategory,
        questions) => {
        try {
            const quizData = await Quiz.create({
                quizCategory,
                quizDifficulty,
                subCategory,
                questions
            })
            return quizData
        } catch (error) {
            console.log(error)
            throw new Error(error)
        }
    }
}