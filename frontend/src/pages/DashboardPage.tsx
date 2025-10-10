import React from 'react';
import { motion } from 'framer-motion';
import { Shield, MapPin, Smartphone, Users, CheckCircle, AlertTriangle, Clock, Heart, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  
  const safetyStatus = {
    monitoring: true,
    location: "Ahmedabad, Gujarat",
    zone: "Safe",
    lastUpdate: "2 minutes ago"
  };

  const recentActivity = [
    { time: "2 min ago", event: "Location updated", status: "safe" },
    { time: "15 min ago", event: "Entered safe zone", status: "safe" },
    { time: "1 hour ago", event: "AI monitoring started", status: "active" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="gradient-bg text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-bold mb-4">
              Welcome back, {user?.firstName || 'Tourist'}!
            </h1>
            <p className="text-xl text-blue-100">
              Your AI-powered protection is active and monitoring your safety
            </p>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Safety Status */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2"
            >
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Safety Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-green-900">AI Monitoring</h3>
                        <p className="text-green-700">Active</p>
                      </div>
                    </div>
                    <p className="text-green-800 text-sm">
                      Your AI safety system is actively monitoring your surroundings for any potential threats.
                    </p>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <MapPin className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900">Current Location</h3>
                        <p className="text-blue-700">{safetyStatus.location}</p>
                      </div>
                    </div>
                    <p className="text-blue-800 text-sm">
                      You're currently in a safe zone with good emergency response coverage.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="space-y-4">
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Emergency Alert</span>
                  </button>
                  <button className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Share Location</span>
                  </button>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2">
                    <Heart className="h-5 w-5" />
                    <span>I'm Safe</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-3"
            >
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${
                        activity.status === 'safe' ? 'bg-green-500' : 
                        activity.status === 'active' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.event}</p>
                        <p className="text-sm text-gray-600">{activity.time}</p>
                      </div>
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
