const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Responder = require('../models/Responder');
const { protect } = require('../middleware/auth');
const { sendEmergencyAlert } = require('../services/smsService');

const router = express.Router();

// @desc    Send emergency alert
// @route   POST /api/emergency/alert
// @access  Private
router.post('/alert', [
  protect,
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  body('message').optional().trim().isLength({ max: 200 }).withMessage('Message too long')
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

    const { latitude, longitude, message } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get emergency contacts
    const emergencyContacts = user.emergencyContacts || [];
    
    // Get active responders
    const responders = await Responder.find({ isActive: true });
    
    // Combine all recipients
    const allRecipients = [
      ...emergencyContacts.map(contact => ({
        name: contact.name,
        phone: contact.phone,
        type: 'emergency_contact'
      })),
      ...responders.map(responder => ({
        name: responder.name,
        phone: responder.phone,
        type: 'responder',
        department: responder.department
      }))
    ];

    if (allRecipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No emergency contacts or responders found'
      });
    }

    // Prepare location data
    const locationData = {
      latitude,
      longitude,
      address: 'Current location', // You can add reverse geocoding here
      timestamp: new Date()
    };

    // Prepare user info
    const userInfo = {
      name: `${user.firstName} ${user.lastName}`,
      phone: user.phone,
      email: user.email,
      nationality: user.nationality
    };

    // Send emergency alerts
    const alertResults = await sendEmergencyAlert(allRecipients, locationData, userInfo);

    // Log the emergency alert
    console.log('🚨 EMERGENCY ALERT SENT:', {
      user: userInfo.name,
      location: locationData,
      recipients: allRecipients.length,
      results: alertResults
    });

    res.json({
      success: true,
      message: 'Emergency alert sent successfully',
      data: {
        user: userInfo,
        location: locationData,
        recipients: {
          total: allRecipients.length,
          emergencyContacts: emergencyContacts.length,
          responders: responders.length
        },
        results: alertResults
      }
    });

  } catch (error) {
    console.error('Emergency alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send emergency alert'
    });
  }
});

// @desc    Get emergency responders
// @route   GET /api/emergency/responders
// @access  Private
router.get('/responders', protect, async (req, res) => {
  try {
    const responders = await Responder.find({ isActive: true });
    
    res.json({
      success: true,
      responders: responders.map(responder => ({
        id: responder._id,
        name: responder.name,
        department: responder.department,
        location: responder.location,
        responseTime: responder.responseTime
      }))
    });
  } catch (error) {
    console.error('Get responders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get responders'
    });
  }
});

// @desc    Add emergency responder (Admin only - for now, anyone can add)
// @route   POST /api/emergency/responders
// @access  Private
router.post('/responders', [
  protect,
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name is required'),
  body('phone').isLength({ min: 10, max: 15 }).withMessage('Valid phone number is required'),
  body('department').isIn(['Police', 'Medical', 'Fire', 'Tourist Police', 'Emergency Services']).withMessage('Valid department is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, phone, email, department, location } = req.body;

    const responder = await Responder.create({
      name,
      phone,
      email,
      department,
      location
    });

    res.status(201).json({
      success: true,
      message: 'Responder added successfully',
      responder: {
        id: responder._id,
        name: responder.name,
        phone: responder.phone,
        department: responder.department,
        location: responder.location
      }
    });
  } catch (error) {
    console.error('Add responder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add responder'
    });
  }
});

module.exports = router;

