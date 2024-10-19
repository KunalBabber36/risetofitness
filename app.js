const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const path = require('path');
const app = express();

const accountSid = 'AC1c5b02253722c3d78da0c50da7ed05db'; // Replace with your Twilio Account SID
const authToken = 'b6697cf47f7d8f9b89f35e4791a98015';   // Replace with your Twilio Auth Token
const client = new twilio(accountSid, authToken);

// Middleware to parse form data

app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'public')));
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });



// app.use(express.static('html'));
// app.use(express.static('css'));
// app.use(express.static('assets'));
// app.use(express.static('images'));
// app.use(express.static('js'));


// Route to serve the contact form at the root URL ('/')
app.get('/', (req, res) => {
    res.send(`
    <form action="/contact" method="POST">
         <div class="group-field">
          <P>
              <span class="wpcf7-form-control-wrap" data-name="Fname">
                <input size="40" class="wpcf7-form-control wpcf7-text wpcf7-validates-as-required" aria-required="true" aria-invalid="false" placeholder="First Name *" value="" type="text" name="Fname" required id="Fname"></span><br>
              <span class="wpcf7-form-control-wrap" data-name="Lname">
                <input size="40" class="wpcf7-form-control wpcf7-text wpcf7-validates-as-required" aria-required="true" aria-invalid="false" placeholder="Last Name *" value="" type="text" name="Lname" id="Lname"></span><br>
          </P>
          <div class="group-field">
              <p><span class="wpcf7-form-control-wrap" data-name="email">
                <input size="40" class="wpcf7-form-control wpcf7-email wpcf7-validates-as-required wpcf7-text wpcf7-validates-as-email" aria-required="true" aria-invalid="false" placeholder="Email *" value="" type="email" name="email" required id="email"></span><br>
                <span class="wpcf7-form-control-wrap" data-name="phone">
                  <input size="40" maxlength="12" minlength="10" class="wpcf7-form-control wpcf7-tel wpcf7-validates-as-required wpcf7-text wpcf7-validates-as-tel" aria-required="true" aria-invalid="false" placeholder="Phone *" value="" type="tel" name="phone" required id="phone"></span>
              </p>
              </div>
              <p><span class="wpcf7-form-control-wrap" data-name="message">
                <textarea cols="40" rows="10" class="wpcf7-form-control wpcf7-textarea wpcf7-validates-as-required" aria-required="true" aria-invalid="false" placeholder="Message *" name="message" required id="message"></textarea></span><br>
                  <button class="wpcf7-form-control1 wpcf7-submit has-spinner btn-primary" type="submit">Submit</button>
                  <span class="wpcf7-spinner"></span>
                  </p>
         </div>
        </form>
    `);
});

// Route to handle contact form submission
// Route to handle contact form submission
app.post('/contact', (req, res) => {
    const { Fname, Lname, email, phone, message } = req.body;
    const whatsappMessage = `New Contact Form Submission From Rise To Fitness Website:\nFirst Name: ${Fname}\nLast Name: ${Lname}\nEmail: ${email}\nPhoneNo: ${phone}\nMessage: ${message}`;
    
    client.messages
    .create({
        body: whatsappMessage,
        from: 'whatsapp:+14155238886', // Your Twilio WhatsApp sandbox number
        to: 'whatsapp:+918252338182' // Your WhatsApp number that is linked to the sandbox
    })
    .then((message) => {
        console.log(`Message sent: ${message.sid}`);
        
        // Send a success notification as HTML
        res.send(`
            <div style="text-align: center; padding: 20px;">
                <h2 style="color: green;">Form submitted successfully!</h2>
                <p>Thank you for reaching out to us, ${Fname} ${Lname}. We will get back to you soon.</p>
                <a href="/" style="text-decoration: none; color: blue;">Go back to the form</a>
            </div>
        `);
    })
    .catch((err) => {
        console.error('Error sending message:', err);

        // Send an error notification as HTML
        res.status(500).send(`
            <div style="text-align: center; padding: 20px;">
                <h2 style="color: red;">Error occurred while sending your message.</h2>
                <p>There was an issue submitting your form. Please try again later.</p>
                <a href="/" style="text-decoration: none; color: blue;">Go back to the form</a>
            </div>
        `);
    });
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
