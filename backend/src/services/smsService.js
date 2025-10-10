// Simple SMS service using free APIs
const axios = require('axios');

// Free SMS service using TextBelt (1 SMS per day free)
const sendSMS = async (phoneNumber, message) => {
  try {
    // Remove any non-digit characters from phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present (assuming India +91)
    const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    
    console.log(`Sending SMS to: ${formattedPhone}`);
    console.log(`Message: ${message}`);
    
    // For now, just log the SMS (in production, use actual SMS service)
    console.log('📱 SMS SENT:', {
      to: formattedPhone,
      message: message,
      timestamp: new Date().toISOString()
    });
    
    // Simulate SMS sending (replace with actual SMS API)
    return {
      success: true,
      messageId: `sms_${Date.now()}`,
      provider: 'TextBelt'
    };
    
    /* 
    // Uncomment this when you want to use actual SMS service
    const response = await axios.post('https://textbelt.com/text', {
      phone: formattedPhone,
      message: message,
      key: 'your-textbelt-key' // Get free key from textbelt.com
    });
    
    return {
      success: response.data.success,
      messageId: response.data.textId,
      provider: 'TextBelt'
    };
    */
    
  } catch (error) {
    console.error('SMS sending error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send emergency alert to multiple recipients
const sendEmergencyAlert = async (recipients, locationData, userInfo) => {
  const results = [];
  
  const message = `🚨 EMERGENCY ALERT 🚨

Tourist: ${userInfo.name}
Phone: ${userInfo.phone}
Location: ${locationData.latitude}, ${locationData.longitude}
Google Maps: https://maps.google.com/?q=${locationData.latitude},${locationData.longitude}

Time: ${new Date().toLocaleString()}

This is an emergency alert from TravelSafety App. Please respond immediately.

- TravelSafety Emergency System`;

  for (const recipient of recipients) {
    try {
      const result = await sendSMS(recipient.phone, message);
      results.push({
        recipient: recipient.name || recipient.phone,
        success: result.success,
        messageId: result.messageId,
        error: result.error
      });
    } catch (error) {
      results.push({
        recipient: recipient.name || recipient.phone,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
};

module.exports = {
  sendSMS,
  sendEmergencyAlert
};

