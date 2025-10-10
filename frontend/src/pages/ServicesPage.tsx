import React from 'react';
import { motion } from 'framer-motion';
import { Shield, MapPin, Smartphone, Users, Zap, Globe, Clock, Heart } from 'lucide-react';

const ServicesPage: React.FC = () => {
  const services = [
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: "AI-Powered Monitoring",
      description: "24/7 intelligent monitoring using advanced AI to detect emergencies before they happen.",
      features: ["Fall detection", "Scream recognition", "Fight detection", "Crowd analysis"]
    },
    {
      icon: <MapPin className="h-8 w-8 text-green-600" />,
      title: "Real-time Location Tracking",
      description: "GPS monitoring with geo-fencing alerts for dangerous areas and safe zones.",
      features: ["GPS tracking", "Geo-fencing", "Safe zone alerts", "Route monitoring"]
    },
    {
      icon: <Smartphone className="h-8 w-8 text-purple-600" />,
      title: "Instant Emergency Response",
      description: "Automatic emergency service alerts with your exact location and situation details.",
      features: ["Auto-dial emergency", "Location sharing", "Situation details", "Multi-language support"]
    },
    {
      icon: <Users className="h-8 w-8 text-orange-600" />,
      title: "Family Notifications",
      description: "Keep your loved ones informed with real-time updates and emergency notifications.",
      features: ["Real-time updates", "Emergency alerts", "Status sharing", "Peace of mind"]
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
            <h1 className="text-5xl font-bold mb-6">Our Services</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Comprehensive AI-powered safety solutions designed to protect you wherever you travel.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card"
              >
                <div className="mb-4">{service.icon}</div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
