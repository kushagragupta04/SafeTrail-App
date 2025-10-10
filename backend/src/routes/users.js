const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        nationality: user.nationality,
        digitalId: user.digitalId,
        isVerified: user.isVerified,
        emergencyContacts: user.emergencyContacts,
        safetySettings: user.safetySettings,
        currentLocation: user.currentLocation,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', [
  protect,
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('nationality').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Nationality is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, phone, nationality, emergencyContacts } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (nationality) updateData.nationality = nationality;
    if (emergencyContacts) updateData.emergencyContacts = emergencyContacts;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        nationality: user.nationality,
        digitalId: user.digitalId,
        isVerified: user.isVerified,
        emergencyContacts: user.emergencyContacts,
        safetySettings: user.safetySettings,
        currentLocation: user.currentLocation
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update safety settings
// @route   PUT /api/users/safety-settings
// @access  Private
router.put('/safety-settings', [
  protect,
  body('locationTracking').optional().isBoolean().withMessage('Location tracking must be a boolean'),
  body('audioMonitoring').optional().isBoolean().withMessage('Audio monitoring must be a boolean'),
  body('videoMonitoring').optional().isBoolean().withMessage('Video monitoring must be a boolean'),
  body('emergencyAlerts').optional().isBoolean().withMessage('Emergency alerts must be a boolean'),
  body('familyNotifications').optional().isBoolean().withMessage('Family notifications must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { locationTracking, audioMonitoring, videoMonitoring, emergencyAlerts, familyNotifications } = req.body;

    const safetySettings = {};
    if (locationTracking !== undefined) safetySettings.locationTracking = locationTracking;
    if (audioMonitoring !== undefined) safetySettings.audioMonitoring = audioMonitoring;
    if (videoMonitoring !== undefined) safetySettings.videoMonitoring = videoMonitoring;
    if (emergencyAlerts !== undefined) safetySettings.emergencyAlerts = emergencyAlerts;
    if (familyNotifications !== undefined) safetySettings.familyNotifications = familyNotifications;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { safetySettings },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Safety settings updated successfully',
      safetySettings: user.safetySettings
    });
  } catch (error) {
    console.error('Update safety settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update current location
// @route   PUT /api/users/location
// @access  Private
router.put('/location', [
  protect,
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  body('address').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Address must be between 5 and 200 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { latitude, longitude, address } = req.body;

    const currentLocation = {
      latitude,
      longitude,
      address: address || 'Unknown location',
      lastUpdated: new Date(),
      isActive: true
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { currentLocation },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Location updated successfully',
      currentLocation: user.currentLocation
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add emergency contact
// @route   POST /api/users/emergency-contacts
// @access  Private
router.post('/emergency-contacts', [
  protect,
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('phone').isLength({ min: 10, max: 15 }).withMessage('Please provide a valid phone number (10-15 digits)'),
  body('relationship').trim().isLength({ min: 2, max: 20 }).withMessage('Relationship is required'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    console.log('Emergency contact request body:', req.body);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, phone, relationship, email } = req.body;

    const user = await User.findById(req.user._id);

    // Check if contact already exists
    const existingContact = user.emergencyContacts.find(
      contact => contact.phone === phone
    );

    if (existingContact) {
      return res.status(400).json({
        success: false,
        message: 'Emergency contact with this phone number already exists'
      });
    }

    // Add new emergency contact
    user.emergencyContacts.push({
      name,
      phone,
      relationship,
      email
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Emergency contact added successfully',
      emergencyContacts: user.emergencyContacts
    });
  } catch (error) {
    console.error('Add emergency contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update emergency contact
// @route   PUT /api/users/emergency-contacts/:contactId
// @access  Private
router.put('/emergency-contacts/:contactId', [
  protect,
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('phone').optional().isLength({ min: 10, max: 15 }).withMessage('Please provide a valid phone number (10-15 digits)'),
  body('relationship').optional().trim().isLength({ min: 2, max: 20 }).withMessage('Relationship is required'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { contactId } = req.params;
    const { name, phone, relationship, email } = req.body;

    const user = await User.findById(req.user._id);

    // Find the contact
    const contact = user.emergencyContacts.id(contactId);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found'
      });
    }

    // Update contact
    if (name) contact.name = name;
    if (phone) contact.phone = phone;
    if (relationship) contact.relationship = relationship;
    if (email !== undefined) contact.email = email;

    await user.save();

    res.json({
      success: true,
      message: 'Emergency contact updated successfully',
      emergencyContacts: user.emergencyContacts
    });
  } catch (error) {
    console.error('Update emergency contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete emergency contact
// @route   DELETE /api/users/emergency-contacts/:contactId
// @access  Private
router.delete('/emergency-contacts/:contactId', protect, async (req, res) => {
  try {
    const { contactId } = req.params;

    const user = await User.findById(req.user._id);

    // Find and remove the contact
    const contact = user.emergencyContacts.id(contactId);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found'
      });
    }

    contact.remove();
    await user.save();

    res.json({
      success: true,
      message: 'Emergency contact deleted successfully',
      emergencyContacts: user.emergencyContacts
    });
  } catch (error) {
    console.error('Delete emergency contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Test emergency contacts endpoint
// @route   GET /api/users/test-contacts
// @access  Private
router.get('/test-contacts', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      message: 'Emergency contacts test',
      user: {
        id: user._id,
        name: user.firstName + ' ' + user.lastName,
        emergencyContacts: user.emergencyContacts,
        contactsCount: user.emergencyContacts.length
      }
    });
  } catch (error) {
    console.error('Test contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // In a real application, you would calculate these from incident data
    const stats = {
      totalIncidents: 0,
      resolvedIncidents: 0,
      activeIncidents: 0,
      averageResponseTime: 0,
      safetyScore: 95,
      lastIncidentDate: null,
      totalTravelDays: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Deactivate account
// @route   DELETE /api/users/account
// @access  Private
router.delete('/account', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { isActive: false },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
