const Email = require("../models/email");

module.exports={
    saveEmailToDB : async({name,email,phone,message})=>{
        try {
            const enquiry = new Email({ name, email, phone, message });
            const saveEmail = await enquiry.save();
            return saveEmail;
        } catch (error) {
            console.log(error)
            throw new Error('Error saving email : ',error);
        }
    } 
} 