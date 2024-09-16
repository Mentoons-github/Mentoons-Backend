const Email = require("../models/email");

module.exports={
    saveEmailToDB : async({name,email,countryCode,phone,message})=>{
        try {
            const enquiry = new Email({ name, email,countryCode, phone, message });
            const saveEmail = await enquiry.save();
            return saveEmail;
        } catch (error) {
            console.log(error)
            throw new Error('Error saving email : ',error);
        }
    }, 
    getLeadsFromDB: async ()=>{
        try {
            const users = await Email.find({});
            return users;
        } catch (error) {
            console.log(error)
            throw new Error('Data cannot be found')
        }
    }
} 