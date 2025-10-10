const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  // Basic incident information
  incidentId: {
    type: String,
    unique: true,
    required: true
  },
  touristId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  incidentType: {
    type: String,
    required: true,
    enum: [
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
    ]
  },
  severity: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 3
  },
  status: {
    type: String,
    required: true,
    enum: ['reported', 'acknowledged', 'in_progress', 'resolved', 'cancelled'],
    default: 'reported'
  },
  
  // Location information
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    zone: {
      type: String,
      enum: ['safe', 'caution', 'danger', 'restricted'],
      default: 'safe'
    },
    accuracy: Number // GPS accuracy in meters
  },
  
  // AI detection details
  aiDetection: {
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    detectionMethod: {
      type: String,
      enum: ['audio', 'video', 'location', 'manual', 'sensor'],
      required: true
    },
    modelVersion: String,
    processingTime: Number // in milliseconds
  },
  
  // Evidence and media
  evidence: {
    audioFile: String,
    videoFile: String,
    imageFiles: [String],
    evidenceHash: String, // For blockchain storage
    fileSize: Number,
    duration: Number // for audio/video files
  },
  
  // Response information
  responders: [{
    responderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    responderType: {
      type: String,
      enum: ['police', 'medical', 'security', 'admin', 'volunteer']
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['assigned', 'en_route', 'on_scene', 'completed'],
      default: 'assigned'
    },
    responseTime: Number, // in minutes
    notes: String
  }],
  
  // Communication logs
  communications: [{
    type: {
      type: String,
      enum: ['call', 'sms', 'email', 'push_notification', 'in_app']
    },
    recipient: String,
    message: String,
    sentAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent'
    }
  }],
  
  // Resolution details
  resolution: {
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolutionType: {
      type: String,
      enum: ['medical_treatment', 'police_intervention', 'security_escort', 'self_resolved', 'false_alarm']
    },
    description: String,
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: Date
  },
  
  // Blockchain integration
  blockchain: {
    transactionHash: String,
    blockNumber: Number,
    gasUsed: Number,
    deployedAt: Date,
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  
  // Metadata
  reportedBy: {
    type: String,
    enum: ['ai_system', 'tourist', 'witness', 'responder', 'admin'],
    default: 'ai_system'
  },
  source: {
    type: String,
    enum: ['mobile_app', 'web_dashboard', 'ai_monitoring', 'manual_report'],
    default: 'ai_monitoring'
  },
  
  // Timestamps
  detectedAt: {
    type: Date,
    default: Date.now
  },
  acknowledgedAt: Date,
  resolvedAt: Date,
  
  // Additional data
  tags: [String],
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
incidentSchema.index({ incidentId: 1 });
incidentSchema.index({ touristId: 1 });
incidentSchema.index({ status: 1 });
incidentSchema.index({ incidentType: 1 });
incidentSchema.index({ severity: 1 });
incidentSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
incidentSchema.index({ detectedAt: -1 });
incidentSchema.index({ createdAt: -1 });

// Virtual for response time
incidentSchema.virtual('responseTime').get(function() {
  if (this.acknowledgedAt && this.detectedAt) {
    return Math.round((this.acknowledgedAt - this.detectedAt) / 1000 / 60); // in minutes
  }
  return null;
});

// Virtual for resolution time
incidentSchema.virtual('resolutionTime').get(function() {
  if (this.resolvedAt && this.detectedAt) {
    return Math.round((this.resolvedAt - this.detectedAt) / 1000 / 60); // in minutes
  }
  return null;
});

// Pre-save middleware to generate incident ID
incidentSchema.pre('save', function(next) {
  if (this.isNew && !this.incidentId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    this.incidentId = `INC_${timestamp}_${random}`;
  }
  next();
});

// Instance method to add responder
incidentSchema.methods.addResponder = function(responderData) {
  this.responders.push({
    ...responderData,
    assignedAt: new Date()
  });
  return this.save();
};

// Instance method to update status
incidentSchema.methods.updateStatus = function(newStatus, userId = null) {
  this.status = newStatus;
  
  if (newStatus === 'acknowledged' && !this.acknowledgedAt) {
    this.acknowledgedAt = new Date();
  }
  
  if (newStatus === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
    if (userId) {
      this.resolution.resolvedBy = userId;
    }
  }
  
  return this.save();
};

// Instance method to add communication log
incidentSchema.methods.addCommunication = function(communicationData) {
  this.communications.push({
    ...communicationData,
    sentAt: new Date()
  });
  return this.save();
};

// Static method to get incidents by location
incidentSchema.statics.getIncidentsByLocation = function(latitude, longitude, radius = 1000) {
  return this.find({
    'location.latitude': {
      $gte: latitude - (radius / 111000), // Rough conversion: 1 degree ≈ 111km
      $lte: latitude + (radius / 111000)
    },
    'location.longitude': {
      $gte: longitude - (radius / (111000 * Math.cos(latitude * Math.PI / 180))),
      $lte: longitude + (radius / (111000 * Math.cos(latitude * Math.PI / 180)))
    },
    status: { $in: ['reported', 'acknowledged', 'in_progress'] }
  });
};

// Transform JSON output
incidentSchema.methods.toJSON = function() {
  const incidentObject = this.toObject();
  incidentObject.responseTime = this.responseTime;
  incidentObject.resolutionTime = this.resolutionTime;
  return incidentObject;
};

module.exports = mongoose.model('Incident', incidentSchema);
