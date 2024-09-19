const WorkshopData = require("../models/workshop")

module.exports = {
    saveFormToDB: async (name,
        guardianName,
        guardianContact,
        city,
        message,
        appliedWorkshop,
        age) => {
            console.log(appliedWorkshop,'0po0po0')
        try {
            const newWorkshopForm = new WorkshopData({
                name,
                guardianName,
                guardianContact,
                city,
                message,
                appliedWorkshop,
                age
            })
            const workshopFormData = await newWorkshopForm.save();
            return workshopFormData
        } catch (error) {
            console.log(error)
            throw new Error(error)
        }
    }
}