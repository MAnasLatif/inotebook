const express = require('express');
const User = require('../models/User')
const router = express.Router()
const { body, validationResult } = require('express-validator');


router.post('/createuser', [
  body('email', 'Enter a Valid Email').isEmail(),
  body('name', 'Name minimum lenght is 5').isLength({ min: 3 }),
  body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {
  // if there are errors, return Bad request and the error 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // check whether the user with this email exail exists already

  try {

    let user = await User.findOne({ email: req.body.email });

    if (user) {
      return res.status(400).json({ error: "Sorry a user with this email already exists " })
    }

    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    })
    res.json(user)
  } catch (error) {
    res.status(500).send("Some Error Occured");
  }
})

module.exports = router;