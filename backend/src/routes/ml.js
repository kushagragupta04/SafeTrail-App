const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Incident = require('../models/Incident');
const { protect } = require('../middleware/auth');
const pythonMLService = require('../services/pythonMLService');

const router = express.Router();

// @desc    Analyze location data with ML model
// @route   POST /api/ml/analyze-location
// @access  Private
router.post('/analyze-location', [
  protect,
  body('coordinates.latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('coordinates.longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
  body('coordinates.accuracy').isFloat({ min: 0 }).withMessage('Valid accuracy is required'),
  body('timestamp').isISO8601().withMessage('Valid timestamp is required')
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

    const { coordinates, timestamp, metadata } = req.body;
    const userId = req.user._id;

    console.log(`🤖 ML Analysis request from user ${userId}:`, {
      lat: coordinates.latitude,
      lng: coordinates.longitude,
      accuracy: coordinates.accuracy,
      timestamp
    });

    // Update user's current location
    await User.findByIdAndUpdate(userId, {
      currentLocation: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        accuracy: coordinates.accuracy,
        altitude: coordinates.altitude || 0,
        speed: coordinates.speed || 0,
        heading: coordinates.heading || 0,
        lastUpdated: new Date(),
        isActive: true
      }
    });

    // Send coordinates to Python ML model for analysis
    const mlAnalysis = await pythonMLService.analyzeLocation(coordinates, userId);

    // Store ML analysis result
    const analysisResult = {
      userId,
      coordinates,
      timestamp: new Date(),
      mlAnalysis,
      metadata: metadata || {}
    };

    // If ML detects safety concerns, create incident record
    if (mlAnalysis.safetyAlert) {
      await createMLIncident(userId, coordinates, mlAnalysis);
    }

    res.json({
      success: true,
      data: {
        riskLevel: mlAnalysis.riskLevel,
        prediction: mlAnalysis.prediction,
        confidence: mlAnalysis.confidence,
        insights: mlAnalysis.insights,
        recommendations: mlAnalysis.recommendations,
        safetyAlert: mlAnalysis.safetyAlert,
        modelVersion: mlAnalysis.modelVersion,
        processingTime: mlAnalysis.processingTime,
        isFallback: mlAnalysis.isFallback || false,
        timestamp: mlAnalysis.timestamp
      }
    });

  } catch (error) {
    console.error('ML analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'ML analysis failed',
      error: error.message
    });
  }
});

// @desc    Get ML analysis history for user
// @route   GET /api/ml/analysis-history
// @access  Private
router.get('/analysis-history', protect, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    // Get recent incidents created by ML analysis
    const mlIncidents = await Incident.find({
      touristId: req.user._id,
      reportedBy: 'ai_system',
      source: 'ai_monitoring'
    })
    .sort({ detectedAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

    res.json({
      success: true,
      data: {
        incidents: mlIncidents,
        total: mlIncidents.length,
        hasMore: mlIncidents.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get ML analysis history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analysis history'
    });
  }
});

// @desc    Get current risk assessment
// @route   GET /api/ml/risk-assessment
// @access  Private
router.get('/risk-assessment', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.currentLocation) {
      return res.json({
        success: true,
        data: {
          riskLevel: 'unknown',
          message: 'No location data available'
        }
      });
    }

    // Get real-time analysis from Python ML model
    const mlAnalysis = await pythonMLService.analyzeLocation(user.currentLocation, req.user._id);

    res.json({
      success: true,
      data: {
        riskLevel: mlAnalysis.riskLevel,
        prediction: mlAnalysis.prediction,
        confidence: mlAnalysis.confidence,
        insights: mlAnalysis.insights,
        recommendations: mlAnalysis.recommendations,
        modelVersion: mlAnalysis.modelVersion,
        timestamp: mlAnalysis.timestamp
      }
    });

  } catch (error) {
    console.error('Risk assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Risk assessment failed'
    });
  }
});

// @desc    Get ML model status
// @route   GET /api/ml/status
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    const modelStatus = await pythonMLService.getModelStatus();
    
    res.json({
      success: true,
      data: modelStatus
    });

  } catch (error) {
    console.error('Get ML status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ML model status'
    });
  }
});

// @desc    Get ML model metrics
// @route   GET /api/ml/metrics
// @access  Private
router.get('/metrics', protect, async (req, res) => {
  try {
    const metrics = await pythonMLService.getModelMetrics();
    
    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Get ML metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ML model metrics'
    });
  }
});

// Simulate ML analysis (replace with actual ML model integration)
async function performMLAnalysis(coordinates, userId) {
  // This is a simulation - replace with your actual ML model
  const { latitude, longitude, accuracy } = coordinates;
  
  // Simulate risk assessment based on location
  let riskLevel = 'low';
  let safetyAlert = null;
  let insights = [];
  let recommendations = [];
  let confidence = 0.85;

  // Example: Check if location is in a known high-risk area
  // You would replace this with your actual ML model logic
  if (isHighRiskArea(latitude, longitude)) {
    riskLevel = 'high';
    safetyAlert = {
      type: 'high_risk_area',
      severity: 'high',
      message: 'You are in a high-risk area. Please exercise caution.',
      confidence: 0.9
    };
    insights.push('Location identified as high-risk zone');
    recommendations.push('Avoid staying in this area for extended periods');
    recommendations.push('Stay alert and aware of surroundings');
  } else if (isMediumRiskArea(latitude, longitude)) {
    riskLevel = 'medium';
    insights.push('Location has moderate risk factors');
    recommendations.push('Be cautious and aware of your surroundings');
  } else {
    insights.push('Location appears to be safe');
    recommendations.push('Continue normal activities with standard safety precautions');
  }

  // Simulate additional ML insights
  if (accuracy > 50) {
    insights.push('Location accuracy is low - consider moving to open area');
  }

  return {
    riskLevel,
    safetyAlert,
    insights,
    recommendations,
    confidence,
    analysisTime: new Date().toISOString()
  };
}

// Create incident record for ML-detected safety concerns
async function createMLIncident(userId, coordinates, mlAnalysis) {
  try {
    const incident = await Incident.create({
      touristId: userId,
      incidentType: 'ai_detected_risk',
      severity: mlAnalysis.safetyAlert?.severity || 'medium',
      status: 'reported',
      location: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        accuracy: coordinates.accuracy,
        address: 'AI Detected Location'
      },
      aiDetection: {
        confidence: mlAnalysis.confidence,
        method: 'ml_analysis',
        riskLevel: mlAnalysis.riskLevel,
        insights: mlAnalysis.insights
      },
      notes: `AI-detected safety concern: ${mlAnalysis.safetyAlert?.message || 'Risk assessment triggered'}`,
      reportedBy: 'ai_system',
      source: 'ai_monitoring'
    });

    console.log(`🚨 ML Incident created: ${incident._id}`);
    return incident;
  } catch (error) {
    console.error('Error creating ML incident:', error);
    throw error;
  }
}

// Assess current risk level
async function assessCurrentRisk(location, userId) {
  // Simulate risk assessment
  const riskLevel = isHighRiskArea(location.latitude, location.longitude) ? 'high' : 
                   isMediumRiskArea(location.latitude, location.longitude) ? 'medium' : 'low';
  
  return {
    riskLevel,
    confidence: 0.85,
    lastUpdated: new Date().toISOString(),
    factors: [
      'Location-based risk assessment',
      'Historical incident data',
      'Time of day analysis',
      'Area safety rating'
    ]
  };
}

// Helper functions for risk assessment (replace with your actual data)
function isHighRiskArea(lat, lng) {
  // Example: Define high-risk areas (replace with your actual data)
  // This is just a simulation
  return Math.random() < 0.1; // 10% chance of high risk for demo
}

function isMediumRiskArea(lat, lng) {
  // Example: Define medium-risk areas
  return Math.random() < 0.3; // 30% chance of medium risk for demo
}

module.exports = router;
