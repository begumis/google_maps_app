const router = require('express').Router();
let User = require('../models/user.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.status(201).json('User registered');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json('User not found');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json('Invalid credentials');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({token });
   
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization').split(' ')[1];
  if (!token) return res.status(401).json('Access Denied');

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json('Invalid Token');
  }
};

// Get User Profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Update User Location
router.post('/update-location', verifyToken, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json('User not found');
    user.location = { lat, lng };
    await user.save();
    res.json('Location updated');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

module.exports = router;
