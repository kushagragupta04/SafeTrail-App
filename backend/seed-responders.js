const mongoose = require('mongoose');
const Responder = require('./src/models/Responder');
require('dotenv').config();

// Sample responders data
const sampleResponders = [
  {
    name: 'Ahmedabad Police Control Room',
    phone: '100',
    email: 'police@ahmedabad.gov.in',
    department: 'Police',
    location: {
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India'
    },
    responseTime: 10
  },
  {
    name: 'Tourist Police Ahmedabad',
    phone: '1098',
    email: 'tourist@ahmedabad.gov.in',
    department: 'Tourist Police',
    location: {
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India'
    },
    responseTime: 15
  },
  {
    name: 'Emergency Medical Services',
    phone: '108',
    email: 'ems@gujarat.gov.in',
    department: 'Medical',
    location: {
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India'
    },
    responseTime: 12
  },
  {
    name: 'Fire Department Ahmedabad',
    phone: '101',
    email: 'fire@ahmedabad.gov.in',
    department: 'Fire',
    location: {
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India'
    },
    responseTime: 8
  },
  {
    name: 'Tourist Helpline India',
    phone: '1363',
    email: 'helpline@tourism.gov.in',
    department: 'Emergency Services',
    location: {
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India'
    },
    responseTime: 20
  }
];

async function seedResponders() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tourist-safety', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing responders
    await Responder.deleteMany({});
    console.log('🗑️ Cleared existing responders');

    // Add sample responders
    const responders = await Responder.insertMany(sampleResponders);
    console.log(`✅ Added ${responders.length} responders to database`);

    // Display added responders
    console.log('\n📋 Added Responders:');
    responders.forEach((responder, index) => {
      console.log(`${index + 1}. ${responder.name} (${responder.department})`);
      console.log(`   Phone: ${responder.phone}`);
      console.log(`   Location: ${responder.location.city}, ${responder.location.state}`);
      console.log(`   Response Time: ${responder.responseTime} minutes\n`);
    });

    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding function
seedResponders();

