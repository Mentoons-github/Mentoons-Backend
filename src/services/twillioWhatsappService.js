const twilio = require('twilio');
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const whatsappMessage=(message,phone)=>{
    client.messages
  .create({
    body: message,
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: `whatsapp:${phone}`
  })
  .then(message => console.log('Message sent:', message.sid))
  .catch(error => console.error('Error sending message:', error));
}



module.exports = whatsappMessage