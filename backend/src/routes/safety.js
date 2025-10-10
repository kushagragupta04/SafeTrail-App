const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Incident = require('../models/Incident');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get safety status
// @route   GET /api/safety/status
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Check for active incidents
    const activeIncidents = await Incident.find({
      touristId: req.user._id,
      status: { $in: ['reported', 'acknowledged', 'in_progress'] }
    }).sort({ detectedAt: -1 }).limit(5);

    // Calculate safety score
    const safetyScore = calculateSafetyScore(user, activeIncidents);

    // Determine safety status
    const safetyStatus = determineSafetyStatus(safetyScore, activeIncidents);

    res.json({
      success: true,
      safetyStatus: {
        status: safetyStatus,
        score: safetyScore,
        isMonitoring: user.safetySettings.locationTracking,
        currentLocation: user.currentLocation,
        activeIncidents: activeIncidents.length,
        lastUpdate: user.currentLocation?.lastUpdated || user.updatedAt,
        recommendations: getSafetyRecommendations(safetyStatus, activeIncidents)
      }
    });
  } catch (error) {
    console.error('Get safety status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update safety status
// @route   PUT /api/safety/status
// @access  Private
router.put('/status', [
  protect,
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
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

    const { isActive, latitude, longitude, address } = req.body;

    const updateData = {};

    if (latitude && longitude) {
      updateData.currentLocation = {
        latitude,
        longitude,
        address: address || 'Unknown location',
        lastUpdated: new Date(),
        isActive
      };
    } else if (isActive !== undefined) {
      updateData['currentLocation.isActive'] = isActive;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Safety status updated successfully',
      currentLocation: user.currentLocation
    });
  } catch (error) {
    console.error('Update safety status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Emergency alert
// @route   POST /api/safety/emergency
// @access  Private
router.post('/emergency', [
  protect,
  body('emergencyType').isIn(['medical', 'police', 'fire', 'other']).withMessage('Valid emergency type is required'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required')
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

    const { emergencyType, description, latitude, longitude } = req.body;

    // Get user's current location
    const user = await User.findById(req.user._id);
    const location = {
      latitude: latitude || user.currentLocation?.latitude,
      longitude: longitude || user.currentLocation?.longitude,
      address: user.currentLocation?.address || 'Unknown location'
    };

    // Create emergency incident
    const incident = await Incident.create({
      touristId: req.user._id,
      incidentType: 'medical_emergency', // Default to medical for emergency alerts
      severity: 5, // Maximum severity for emergency alerts
      location,
      aiDetection: {
        confidence: 1.0,
        detectionMethod: 'manual',
        modelVersion: 'emergency_alert_v1'
      },
      notes: `Emergency alert: ${emergencyType}. ${description || ''}`,
      reportedBy: 'tourist',
      source: 'mobile_app'
    });

    // In a real application, you would:
    // 1. Send immediate notifications to emergency contacts
    // 2. Alert local emergency services
    // 3. Send location data to responders
    // 4. Create real-time communication channel

    res.status(201).json({
      success: true,
      message: 'Emergency alert sent successfully',
      incident: {
        id: incident._id,
        incidentId: incident.incidentId,
        emergencyType,
        location,
        detectedAt: incident.detectedAt
      }
    });
  } catch (error) {
    console.error('Emergency alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get nearby incidents
// @route   GET /api/safety/nearby
// @access  Private
router.get('/nearby', protect, async (req, res) => {
  try {
    const { radius = 5000 } = req.query; // Default 5km radius

    const user = await User.findById(req.user._id);
    
    if (!user.currentLocation) {
      return res.status(400).json({
        success: false,
        message: 'User location not available'
      });
    }

    const nearbyIncidents = await Incident.getIncidentsByLocation(
      user.currentLocation.latitude,
      user.currentLocation.longitude,
      parseInt(radius)
    );

    // Filter out user's own incidents
    const otherIncidents = nearbyIncidents.filter(
      incident => incident.touristId.toString() !== req.user._id.toString()
    );

    res.json({
      success: true,
      nearbyIncidents: otherIncidents,
      location: {
        latitude: user.currentLocation.latitude,
        longitude: user.currentLocation.longitude,
        radius: parseInt(radius)
      }
    });
  } catch (error) {
    console.error('Get nearby incidents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get safety zones
// @route   GET /api/safety/zones
// @access  Private
router.get('/zones', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.currentLocation) {
      return res.status(400).json({
        success: false,
        message: 'User location not available'
      });
    }

    // In a real application, you would fetch this from a database
    // For now, we'll return mock data
    const safetyZones = [
      {
        id: 'zone_1',
        name: 'Tourist Safe Zone',
        type: 'safe',
        center: {
          latitude: user.currentLocation.latitude + 0.001,
          longitude: user.currentLocation.longitude + 0.001
        },
        radius: 1000,
        description: 'Designated safe area for tourists'
      },
      {
        id: 'zone_2',
        name: 'High Crime Area',
        type: 'danger',
        center: {
          latitude: user.currentLocation.latitude - 0.002,
          longitude: user.currentLocation.longitude - 0.002
        },
        radius: 500,
        description: 'Area with high crime rate - avoid if possible'
      }
    ];

    res.json({
      success: true,
      safetyZones,
      userLocation: user.currentLocation
    });
  } catch (error) {
    console.error('Get safety zones error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Check if user is in safe zone
// @route   GET /api/safety/zone-check
// @access  Private
router.get('/zone-check', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.currentLocation) {
      return res.status(400).json({
        success: false,
        message: 'User location not available'
      });
    }

    // Check if user is in any safety zones
    const zoneStatus = checkZoneStatus(user.currentLocation);

    res.json({
      success: true,
      zoneStatus,
      location: user.currentLocation,
      recommendations: getZoneRecommendations(zoneStatus)
    });
  } catch (error) {
    console.error('Zone check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper functions
function calculateSafetyScore(user, activeIncidents) {
  let score = 100;
  
  // Deduct points for active incidents
  score -= activeIncidents.length * 10;
  
  // Deduct points for high severity incidents
  const highSeverityIncidents = activeIncidents.filter(incident => incident.severity >= 4);
  score -= highSeverityIncidents.length * 15;
  
  // Deduct points if location tracking is off
  if (!user.safetySettings.locationTracking) {
    score -= 20;
  }
  
  // Ensure score doesn't go below 0
  return Math.max(0, score);
}

function determineSafetyStatus(score, activeIncidents) {
  if (activeIncidents.some(incident => incident.severity >= 4)) {
    return 'critical';
  } else if (activeIncidents.length > 0) {
    return 'warning';
  } else if (score >= 80) {
    return 'safe';
  } else if (score >= 60) {
    return 'caution';
  } else {
    return 'danger';
  }
}

function getSafetyRecommendations(status, activeIncidents) {
  const recommendations = [];
  
  switch (status) {
    case 'critical':
      recommendations.push('Seek immediate help');
      recommendations.push('Contact emergency services');
      recommendations.push('Move to a safe location if possible');
      break;
    case 'warning':
      recommendations.push('Stay alert and aware of surroundings');
      recommendations.push('Keep emergency contacts informed');
      recommendations.push('Avoid isolated areas');
      break;
    case 'caution':
      recommendations.push('Enable all safety monitoring features');
      recommendations.push('Share your location with trusted contacts');
      recommendations.push('Stay in well-lit, populated areas');
      break;
    case 'safe':
      recommendations.push('Continue normal activities');
      recommendations.push('Keep safety monitoring active');
      break;
    default:
      recommendations.push('Review safety settings');
      recommendations.push('Enable location tracking');
  }
  
  return recommendations;
}

function checkZoneStatus(location) {
  // Mock zone checking logic
  // In a real application, you would check against a database of safety zones
  
  const mockZones = [
    {
      type: 'safe',
      center: { latitude: location.latitude + 0.001, longitude: location.longitude + 0.001 },
      radius: 1000
    }
  ];
  
  for (const zone of mockZones) {
    const distance = calculateDistance(location, zone.center);
    if (distance <= zone.radius) {
      return {
        inZone: true,
        zoneType: zone.type,
        zoneName: `${zone.type.charAt(0).toUpperCase() + zone.type.slice(1)} Zone`,
        distance: Math.round(distance)
      };
    }
  }
  
  return {
    inZone: false,
    zoneType: 'unknown',
    zoneName: 'No Zone',
    distance: null
  };
}

function getZoneRecommendations(zoneStatus) {
  const recommendations = [];
  
  if (zoneStatus.inZone) {
    if (zoneStatus.zoneType === 'safe') {
      recommendations.push('You are in a safe zone');
      recommendations.push('Continue with your activities');
    } else if (zoneStatus.zoneType === 'danger') {
      recommendations.push('You are in a danger zone');
      recommendations.push('Leave the area immediately');
      recommendations.push('Contact emergency services if needed');
    }
  } else {
    recommendations.push('You are not in a designated safety zone');
    recommendations.push('Stay alert and aware of your surroundings');
  }
  
  return recommendations;
}

function calculateDistance(loc1, loc2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = loc1.latitude * Math.PI / 180;
  const φ2 = loc2.latitude * Math.PI / 180;
  const Δφ = (loc2.latitude - loc1.latitude) * Math.PI / 180;
  const Δλ = (loc2.longitude - loc1.longitude) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

module.exports = router;
