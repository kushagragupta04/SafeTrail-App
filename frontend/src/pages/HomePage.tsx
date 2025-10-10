import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  MapPin, 
  Smartphone, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Play,
  Star,
  Globe,
  Clock,
  Heart,
  Download,
  Zap
} from 'lucide-react';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: "AI-Powered Protection",
      description: "24/7 intelligent monitoring using advanced AI to detect emergencies before they happen."
    },
    {
      icon: <MapPin className="h-8 w-8 text-green-600" />,
      title: "Real-time Location Tracking",
      description: "GPS monitoring with geo-fencing alerts for dangerous areas and safe zones."
    },
    {
      icon: <Smartphone className="h-8 w-8 text-purple-600" />,
      title: "Instant Emergency Response",
      description: "Automatic emergency service alerts with your exact location and situation details."
    },
    {
      icon: <Users className="h-8 w-8 text-orange-600" />,
      title: "Family Connected",
      description: "Keep your loved ones informed with real-time updates and emergency notifications."
    }
  ];

  const stats = [
    { number: "50K+", label: "Protected Travelers" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "2min", label: "Average Response Time" },
    { number: "150+", label: "Countries Covered" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "New York, USA",
      text: "This app saved my life in Mumbai! The AI detected my fall and called for help immediately.",
      rating: 5
    },
    {
      name: "Ahmed Hassan",
      location: "Dubai, UAE",
      text: "As a solo traveler, this gives me peace of mind. The family notifications are amazing.",
      rating: 5
    },
    {
      name: "Maria Garcia",
      location: "Barcelona, Spain",
      text: "The geo-fencing alerts kept me safe in unfamiliar areas. Highly recommended!",
      rating: 5
    }
  ];

  const handleDownloadApp = () => {
    // This will trigger the PWA installation
    if ('serviceWorker' in navigator) {
      const installPrompt = (window as any).deferredPrompt;
      if (installPrompt) {
        installPrompt.prompt();
        installPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          }
          (window as any).deferredPrompt = null;
        });
      } else {
        alert('App download will be available soon! For now, you can use our web version.');
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Travel Safe with
                <span className="block text-yellow-300">AI Protection</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Experience peace of mind with our intelligent safety monitoring system. 
                AI-powered protection that works 24/7 to keep you safe anywhere in the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  Get Protected Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <button 
                  onClick={handleDownloadApp}
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors flex items-center justify-center"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download App
                </button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="glass-effect rounded-2xl p-8">
                <div className="text-center">
                  <div className="w-32 h-32 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Shield className="h-16 w-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Safety Status: ACTIVE</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>AI Monitoring</span>
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Location Tracking</span>
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Emergency Ready</span>
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
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

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced AI system continuously monitors your safety using multiple detection methods
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card hover:transform hover:-translate-y-2"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple 3-Step Process
            </h2>
            <p className="text-xl text-gray-600">
              Get protected in minutes, not hours
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Register & Download</h3>
              <p className="text-gray-600">
                Create your account and download our safety app. Takes less than 2 minutes.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">AI Starts Monitoring</h3>
              <p className="text-gray-600">
                Our AI begins 24/7 monitoring of your location, audio, and surroundings.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Travel with Confidence</h3>
              <p className="text-gray-600">
                Enjoy your trip knowing that help is just seconds away if needed.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Travelers Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied travelers who trust our protection
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.location}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Travel Safely?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of travelers who trust our AI-powered protection system. 
              Get started today and travel with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                <Heart className="mr-2 h-5 w-5" />
                Get Protected Now
              </Link>
              <button 
                onClick={handleDownloadApp}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors flex items-center justify-center"
              >
                <Zap className="mr-2 h-5 w-5" />
                Download App
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
