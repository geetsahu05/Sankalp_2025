const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const fileUpload = require('express-fileupload'); 
require('dotenv').config();

const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(fileUpload()); 
app.use(session({
  secret: process.env.SESSION_SECRET || 'college-fest-secret',
  resave: false,
  saveUninitialized: false
}));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB connection error:", err));


app.use('/admin', require('./routes/admin'));

// Basic authentication
const authenticate = (req, res, next) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.redirect('/admin/login');
  }
};


app.get('/', (req, res) => {
  res.redirect('/admin');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});