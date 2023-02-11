// Imports
const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const port = process.env.PORT || 7909;

const cors = require("cors");
const nodemailer = require("nodemailer");

app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true }).then((res)=>{
    console.log("Connected")
});


// Create counter schema
const counterSchema = new mongoose.Schema({
    value: { type: Number, default: 5000 },
    timestamp: { type: Date, default: Date.now }
});

// Compile schema into model
const Counter = mongoose.model('Counter', counterSchema);

// Increment counter every 15 minutes
setInterval(() => {
    Counter.findOneAndUpdate({}, { $inc: { value: 1 } }, { new: true }, (err, counter) => {
        if (err) {
            console.log(err);
        } else {
            console.log(`Counter value: ${counter.value}`);
        }
    });
}, 900000);

app.post("/send-mail", (req, res) => {
    const na = req.body.name;
    const ema = req.body.gmail;
    const sub = req.body.subject;
    const mes = req.body.message;

    const output = `
            <h4> Contact us form detail. </h4>
            <p><strong>Name : </strong> ${na}</p>
            <p><strong>Email : </strong> ${ema}</p>
            <p><strong>Subject : </strong> ${sub}</p>
            <p><strong>Message : </strong> ${mes}</p>
            <p>Thank you</p>
           `


    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user:  process.env.MAIL_USER, // generated ethereal user
            pass: process.env.MAIL_PASS, // generated ethereal password
        },
    });

    let mailOption = {
        from: 'team@paving-plus.com', // sender address
        to: 'team@paving-plus.com', // list of receivers
        subject: "You got a new query for " + na, // Subject line
        text: "You got a new query for " + na, // plain text body
        html: output, // html body
    }

    // send mail with defined transport object
    transporter.sendMail(mailOption, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            res.redirect('/contact-us');
            console.log("Email sent" + info.response);
        }
    });

})

app.post("/send-newsletter", (req, res) => {
    const ema = req.body.gmail;

    const output = `
            <h4> You got a newsletter form :. </h4>
            <p><strong>Email : </strong> ${ema}</p>
            <p>Thank you</p>
           `


    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user:  process.env.MAIL_USER, // generated ethereal user
            pass: process.env.MAIL_PASS, // generated ethereal password
        },
    });

    let mailOption = {
        from: 'team@paving-plus.com', // sender address
        to: 'team@paving-plus.com', // list of receivers
        subject: "You got a new subscription " , // Subject line
        text: "You got a new subscription", // plain text body
        html: output, // html body
    }

    // send mail with defined transport object
    transporter.sendMail(mailOption, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            res.redirect('/');
            console.log("Email sent" + info.response);
        }
    });

})

// Static Files
app.use(express.static('public'));
// Specific folder example
// app.use('/css', express.static(__dirname + 'public/css'))
// app.use('/js', express.static(__dirname + 'public/js'))
// app.use('/img', express.static(__dirname + 'public/images'))

// Set View's
app.set('views', './views');
app.set('view engine', 'ejs');

// Navigation
app.get('', (req, res) => {
    Counter.findOne((err, counter) => {
        if (err) {
            console.log(err);
        } else {
            res.render('index', { counter });
        }
    });    
})

app.get('/about-us', (req, res) => {
    Counter.findOne((err, counter) => {
        if (err) {
            console.log(err);
        } else {
            res.render('about', { counter });
        }
    });
})

app.get('/products', (req, res) => {
    res.render('product')
})

app.get('/contact-us', (req, res) => {
    res.render('contact')
})

app.get('/privacy-policy', (req, res) => {
    res.render('privacy-policy')
})

app.get('/terms-condition', (req, res) => {
    res.render('terms-condition')
})

app.get('/brochure', (req, res) => {
    res.download("./public/doc/Paving+_Brochure_&_Catalogue.pdf")
})

app.get('*', (req, res) => {
    res.render('404')
})


app.listen(port, () => console.info(`App listening on port ${port}`))
