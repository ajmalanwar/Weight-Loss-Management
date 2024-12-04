var express = require('express');
var router = express.Router();
const User = require('../models/userModel');
const { validationResult } = require('express-validator');
const {validateEmail,validatePassword} = require('./customValidators')
const bcrypt = require('bcrypt');
const session = require('express-session');




router.get('/', (req, res) => {
  const email = req.session.userEmail || null;
  res.render('home', { title: 'Home', email });
});


//route for handling form submission with validations
router.get('/login', (req, res) => {
  const alert = req.query.alert || null;
  res.render('login', { title: 'Login', errors: [], message: null, alert });
});



router.post('/login', [
  validateEmail,
  validatePassword
], async function (req, res) {
  const errors = req.validationErrors || [];

  // Validate the request
  const validationResultErrors = validationResult(req);
  if (!validationResultErrors.isEmpty()) {
    errors.push(...validationResultErrors.array());
  }

  if (errors.length > 0) {
    // Render the form with errors if validation fails
    return res.render('login', { title: 'Login', errors, message: null, alert: null });
  }

  try {
    const { email, password } = req.body;

    // Check if user exists
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      return res.render('login', { title: 'Login', errors: [], message: 'Incorrect Email Address.', alert: null });    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      return res.render('login', { title: 'Login', errors: [], message: 'Incorrect password.', alert: null });    }

    // Set the user data in the session
    req.session.userId = foundUser._id;
    req.session.userEmail = foundUser.email;

    // Redirect to the home page after successful login
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



//signup

router.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up', message: null, error: null });
});


router.post('/signup', (req, res)=>{
  const { email, password, confirmPassword } = req.body;
  const user = new User({ email,password })
  const validationError = user.validateSync();
 
  // Check if the password and confirm password match
  if (password !== confirmPassword) {
    return res.render('signup', { title: 'Sign Up', message: 'Password and Confirm Password do not match', error: null });
  }


   // Check all fields are not empty
  if (validationError){


    return res.render('signup',{title: 'Sign Up',message:null,error:validationError.errors});


  }
  // Check if the username is already taken
  User.findOne({ email })
    .then(existingUser => {
      if (existingUser) {
        return res.render('signup',{title: 'Sign Up',message:'Email already taken',error:null});
      }else{
          //hash the password using bcrypt
         return bcrypt.hash(password,10)
      }
    }).then(hashedPassword => {


     // Create a signup user in MongoDB
      const signupUser = new User({ email, password:hashedPassword });
     return signupUser.save();


    }).then(() => {
      // Redirect to a success page or login page
      res.redirect('/login');
    }).catch(error => {
      console.error(error);
   
    });


})

//route for logout


router.post('/logout' ,(req,res)=>{
  req.session.destroy((err) =>{
    if (err){
      console.log(err);
      res.send('Error')
    }else{
      res.redirect('/');
    }
  });
  });




module.exports = router;