const express = require('express');
const User = require('../models/User')
const router = express.Router()
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fatchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'anastestweb';

router.post('/signin', [
  body('email', 'Enter a Valid Email').isEmail(),
  body('name', 'Name minimum lenght is 5').isLength({ min: 3 }),
  body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {

  // if there are errors, return Bad request and the error 

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {

    // check whether the user with this email exail exists already
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ error: "Sorry a user with this email already exists " })
    }

    // Add password Encryption 
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt);

    // create user 
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass,
    })

    const data = {
      user: {
        id: user.id
      }
    }

    const authtoken = jwt.sign(data, JWT_SECRET)
    res.json({ authtoken })

  } catch (error) {
    res.status(500).send("Some Error Occured");
  }
})

router.post('/login', [
  body('email', 'Enter a Valid Email').isEmail(),
  body('password', 'Password Can\'t be Empty ').exists(),
], async (req, res) => {

  // if there are errors, return Bad request and the error 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Please try to login with correct Credentials" })
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ error: "Please try to login with correct Credentials" })
    }

    const data = {
      user: {
        id: user.id
      }
    }

    const authtoken = jwt.sign(data, JWT_SECRET)
    res.json({ authtoken })

  } catch (error) {
    res.status(500).send("Some Error Occured");
  }
})

// get loggedin User Details
router.post('/getuser',fatchuser , async (req, res) => {
  try {
    let userId = req.user.id
    const user = await User.findById(userId).select("-password")
    res.send(user)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;