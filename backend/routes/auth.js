const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const db = require('../db');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Register Tourist
router.post('/register/tourist', async (req, res) => {
  try {
    const { name, email, password, phone, nationality, passport_number, emergency_contact } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required' 
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if email already exists
    const existingTourist = await db.getQuery(
      'SELECT id FROM tourists WHERE email = ?', 
      [email]
    );

    if (existingTourist) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new tourist
    const result = await db.executeQuery(
      `INSERT INTO tourists (name, email, password, phone, nationality, passport_number, emergency_contact) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, phone, nationality, passport_number, emergency_contact]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: result.id, 
        email: email, 
        userType: 'tourist' 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Tourist registered successfully',
      data: {
        id: result.id,
        name,
        email,
        userType: 'tourist'
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

// Register Police Officer
router.post('/register/police', async (req, res) => {
  try {
    const { badge_number, name, email, password, phone, station, rank } = req.body;

    // Validation
    if (!badge_number || !name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Badge number, name, email, and password are required' 
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if email or badge number already exists
    const existingOfficer = await db.getQuery(
      'SELECT id FROM police_officers WHERE email = ? OR badge_number = ?', 
      [email, badge_number]
    );

    if (existingOfficer) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email or badge number already registered' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new police officer
    const result = await db.executeQuery(
      `INSERT INTO police_officers (badge_number, name, email, password, phone, station, rank) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [badge_number, name, email, hashedPassword, phone, station, rank]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: result.id, 
        email: email, 
        userType: 'police' 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Police officer registered successfully',
      data: {
        id: result.id,
        badge_number,
        name,
        email,
        userType: 'police'
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Validation
    if (!email || !password || !userType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password, and user type are required' 
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }

    let user;
    let tableName;

    // Determine which table to query based on user type
    if (userType === 'tourist') {
      tableName = 'tourists';
    } else if (userType === 'police') {
      tableName = 'police_officers';
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user type' 
      });
    }

    // Find user
    user = await db.getQuery(
      `SELECT * FROM ${tableName} WHERE email = ?`,
      [email]
    );

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        userType: userType 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    delete user.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        ...user,
        userType
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// Get current user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const { id, userType } = req.user;
    let tableName = userType === 'tourist' ? 'tourists' : 'police_officers';

    const user = await db.getQuery(
      `SELECT * FROM ${tableName} WHERE id = ?`,
      [id]
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Remove password from response
    delete user.password;

    res.json({
      success: true,
      data: {
        ...user,
        userType
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching profile' 
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;