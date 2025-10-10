import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Globe,
  Download
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Our Team', path: '/team' },
      { name: 'Careers', path: '/careers' },
      { name: 'Press', path: '/press' },
    ],
    services: [
      { name: 'AI Monitoring', path: '/services#ai-monitoring' },
      { name: 'Emergency Response', path: '/services#emergency' },
      { name: 'Family Notifications', path: '/services#family' },
      { name: 'Travel Safety', path: '/services#travel' },
    ],
    support: [
      { name: 'Help Center', path: '/help' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'Safety Tips', path: '/safety-tips' },
      { name: 'Emergency Guide', path: '/emergency-guide' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Cookie Policy', path: '/cookies' },
      { name: 'GDPR', path: '/gdpr' },
    ]
  };

  const socialLinks = [
    { name: 'Facebook', icon: <Facebook className="h-5 w-5" />, href: '#' },
    { name: 'Twitter', icon: <Twitter className="h-5 w-5" />, href: '#' },
    { name: 'Instagram', icon: <Instagram className="h-5 w-5" />, href: '#' },
    { name: 'LinkedIn', icon: <Linkedin className="h-5 w-5" />, href: '#' },
  ];

  const handleDownloadApp = () => {
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
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">TouristSafety</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              AI-powered travel safety monitoring system that keeps you protected 24/7. 
              Travel with confidence knowing help is always just seconds away.
            </p>
            
            {/* Download App Button */}
            <button
              onClick={handleDownloadApp}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 mb-6"
            >
              <Download className="h-5 w-5" />
              <span>Download App</span>
            </button>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="h-5 w-5" />
                <span>support@touristsafety.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="h-5 w-5" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="h-5 w-5" />
                <span>Bopal, Ahmedabad, India</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} TouristSafety. All rights reserved.
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4 mb-4 md:mb-0">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Legal Links */}
            <div className="flex space-x-6 text-sm">
              {footerLinks.legal.map((link) => (
                <Link 
                  key={link.name}
                  to={link.path} 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-4">Trusted by travelers worldwide</p>
            <div className="flex justify-center items-center space-x-8 text-gray-500">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span className="text-sm">150+ Countries</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm">99.9% Uptime</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span className="text-sm">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
