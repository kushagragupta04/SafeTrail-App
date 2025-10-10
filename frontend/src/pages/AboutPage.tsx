import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Globe, Award, Target, Heart } from 'lucide-react';

const AboutPage: React.FC = () => {
  const stats = [
    { number: "50K+", label: "Protected Travelers" },
    { number: "150+", label: "Countries Covered" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "2min", label: "Average Response Time" }
  ];

  const values = [
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: "Safety First",
      description: "Your safety is our top priority. We use cutting-edge AI technology to ensure you're protected 24/7."
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Community Driven",
      description: "Built by travelers, for travelers. We understand the challenges and create solutions that work."
    },
    {
      icon: <Globe className="h-8 w-8 text-blue-600" />,
      title: "Global Reach",
      description: "Wherever you travel, we're there. Our system works in over 150 countries worldwide."
    },
    {
      icon: <Award className="h-8 w-8 text-purple-600" />,
      title: "Excellence",
      description: "We strive for excellence in everything we do, from technology to customer service."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold mb-6">About TouristSafety</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              We're revolutionizing travel safety with AI-powered monitoring that keeps you protected 
              wherever your adventures take you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                To make travel safe for everyone by leveraging artificial intelligence and 
                real-time monitoring to provide instant protection and peace of mind.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                We believe that everyone deserves to explore the world safely, without fear. 
                Our AI-powered system works tirelessly to ensure you're protected 24/7.
              </p>
              <div className="flex items-center space-x-4">
                <Target className="h-6 w-6 text-primary-600" />
                <span className="text-lg font-semibold text-gray-900">Making travel safe for everyone</span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl p-8">
                <div className="text-center">
                  <Heart className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                  <p className="text-gray-700">
                    A world where every traveler feels safe and confident, 
                    knowing that help is always just seconds away.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card text-center"
              >
                <div className="mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p className="text-xl text-gray-600">
              Experts in AI, travel safety, and emergency response
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="card text-center"
            >
              <div className="w-24 h-24 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Engineers</h3>
              <p className="text-gray-600">
                Building the most advanced safety monitoring systems using machine learning and computer vision.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card text-center"
            >
              <div className="w-24 h-24 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Safety Experts</h3>
              <p className="text-gray-600">
                Former emergency responders and travel safety specialists with decades of experience.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="card text-center"
            >
              <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Globe className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Partners</h3>
              <p className="text-gray-600">
                Working with local emergency services and tourism boards in over 150 countries.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
