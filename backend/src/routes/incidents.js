const express = require('express');
const { body, validationResult } = require('express-validator');
const Incident = require('../models/Incident');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Create new incident
// @route   POST /api/incidents
// @access  Private
router.post('/', [
  protect,
  body('incidentType').isIn([
    'fall_detection',
    'scream_detection', 
    'fight_detection',
    'danger_zone',
    'medical_emergency',
    'theft',
    'assault',
    'natural_disaster',
    'transportation_issue',
    'other'
  ]).withMessage('Valid incident type is required'),
  body('severity').isInt({ min: 1, max: 5 }).withMessage('Severity must be between 1 and 5'),
  body('location.latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('location.longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  body('location.address').trim().isLength({ min: 5, max: 200 }).withMessage('Address is required'),
  body('aiDetection.confidence').isFloat({ min: 0, max: 1 }).withMessage('AI confidence must be between 0 and 1'),
  body('aiDetection.detectionMethod').isIn(['audio', 'video', 'location', 'manual', 'sensor']).withMessage('Valid detection method is required')
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

    const {
      incidentType,
      severity,
      location,
      aiDetection,
      evidence,
      notes
    } = req.body;

    // Create incident
    const incident = await Incident.create({
      touristId: req.user._id,
      incidentType,
      severity,
      location,
      aiDetection,
      evidence: evidence || {},
      notes,
      reportedBy: 'tourist'
    });

    // Update user's current location if provided
    if (location) {
      await User.findByIdAndUpdate(req.user._id, {
        currentLocation: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
          lastUpdated: new Date(),
          isActive: true
        }
      });
    }

    // In a real application, you would:
    // 1. Send notifications to emergency contacts
    // 2. Alert emergency services
    // 3. Store evidence on blockchain
    // 4. Send real-time updates via WebSocket

    res.status(201).json({
      success: true,
      message: 'Incident reported successfully',
      incident: {
        id: incident._id,
        incidentId: incident.incidentId,
        incidentType: incident.incidentType,
        severity: incident.severity,
        status: incident.status,
        location: incident.location,
        detectedAt: incident.detectedAt,
        createdAt: incident.createdAt
      }
    });
  } catch (error) {
    console.error('Create incident error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user's incidents
// @route   GET /api/incidents
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      incidentType,
      severity,
      sortBy = 'detectedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { touristId: req.user._id };
    
    if (status) filter.status = status;
    if (incidentType) filter.incidentType = incidentType;
    if (severity) filter.severity = parseInt(severity);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get incidents
    const incidents = await Incident.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('touristId', 'firstName lastName email phone')
      .select('-__v');

    // Get total count
    const total = await Incident.countDocuments(filter);

    res.json({
      success: true,
      incidents,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single incident
// @route   GET /api/incidents/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const incident = await Incident.findOne({
      _id: req.params.id,
      touristId: req.user._id
    })
    .populate('touristId', 'firstName lastName email phone')
    .populate('responders.responderId', 'firstName lastName email phone')
    .populate('resolution.resolvedBy', 'firstName lastName email');

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    res.json({
      success: true,
      incident
    });
  } catch (error) {
    console.error('Get incident error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update incident status
// @route   PUT /api/incidents/:id/status
// @access  Private
router.put('/:id/status', [
  protect,
  body('status').isIn(['reported', 'acknowledged', 'in_progress', 'resolved', 'cancelled']).withMessage('Valid status is required')
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

    const { status } = req.body;

    const incident = await Incident.findOne({
      _id: req.params.id,
      touristId: req.user._id
    });

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    // Update status
    await incident.updateStatus(status, req.user._id);

    res.json({
      success: true,
      message: 'Incident status updated successfully',
      incident: {
        id: incident._id,
        incidentId: incident.incidentId,
        status: incident.status,
        updatedAt: incident.updatedAt
      }
    });
  } catch (error) {
    console.error('Update incident status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add communication log
// @route   POST /api/incidents/:id/communications
// @access  Private
router.post('/:id/communications', [
  protect,
  body('type').isIn(['call', 'sms', 'email', 'push_notification', 'in_app']).withMessage('Valid communication type is required'),
  body('recipient').trim().isLength({ min: 1, max: 100 }).withMessage('Recipient is required'),
  body('message').trim().isLength({ min: 1, max: 500 }).withMessage('Message is required')
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

    const { type, recipient, message } = req.body;

    const incident = await Incident.findOne({
      _id: req.params.id,
      touristId: req.user._id
    });

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found'
      });
    }

    // Add communication
    await incident.addCommunication({
      type,
      recipient,
      message
    });

    res.json({
      success: true,
      message: 'Communication log added successfully'
    });
  } catch (error) {
    console.error('Add communication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get incidents by location
// @route   GET /api/incidents/location/:latitude/:longitude
// @access  Private
router.get('/location/:latitude/:longitude', protect, async (req, res) => {
  try {
    const { latitude, longitude } = req.params;
    const { radius = 1000 } = req.query; // Default 1km radius

    const incidents = await Incident.getIncidentsByLocation(
      parseFloat(latitude),
      parseFloat(longitude),
      parseInt(radius)
    );

    res.json({
      success: true,
      incidents,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseInt(radius)
      }
    });
  } catch (error) {
    console.error('Get incidents by location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get incident statistics
// @route   GET /api/incidents/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get statistics
    const stats = await Incident.aggregate([
      {
        $match: {
          touristId: req.user._id,
          detectedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalIncidents: { $sum: 1 },
          resolvedIncidents: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          activeIncidents: {
            $sum: { $cond: [{ $in: ['$status', ['reported', 'acknowledged', 'in_progress']] }, 1, 0] }
          },
          averageSeverity: { $avg: '$severity' },
          averageConfidence: { $avg: '$aiDetection.confidence' }
        }
      }
    ]);

    const result = stats[0] || {
      totalIncidents: 0,
      resolvedIncidents: 0,
      activeIncidents: 0,
      averageSeverity: 0,
      averageConfidence: 0
    };

    res.json({
      success: true,
      stats: {
        ...result,
        period,
        startDate,
        endDate: now
      }
    });
  } catch (error) {
    console.error('Get incident stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
