import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const siteMapLinks = [
    { name: 'Search Report', href: '/public-issues' },
    { name: 'Digital India', href: '#' },
    { name: 'Gov Apps', href: '#' },
    { name: 'Passports', href: '#' },
    { name: 'Transport', href: '#' },
    { name: 'eRegistration', href: '#' },
    { name: 'Citizenship', href: '#' },
    { name: 'How to legal', href: '#' },
    { name: 'Pledge', href: '#' }
  ];

  const governmentLinks = [
    { name: 'Constitution of India', href: '#' },
    { name: 'Government Directory', href: '#' },
    { name: 'Indian Parliament', href: '#' },
    { name: 'Publications', href: '#' },
    { name: 'President of India', href: '#' },
    { name: 'Vice President of India', href: '#' },
    { name: 'Prime Minister of India', href: '#' },
    { name: 'Former Prime Minister', href: '#' },
    { name: 'Cabinet Ministers', href: '#' }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: 'M', href: '#' },
    { name: 'LinkedIn', icon: 'in', href: '#' },
    { name: 'Instagram', icon: 'Ig', href: '#' },
    { name: 'GitHub', icon: 'G', href: '#' },
    { name: 'X', icon: 'X', href: '#' }
  ];

  return (
    <footer className="relative bg-white overflow-hidden">
      {/* Purple Wave Background */}
      <div className="absolute inset-x-0 bottom-0 h-96">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
          <path 
            fill="#8B7ECC" 
            fillOpacity="0.3" 
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,106.7C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Site Map */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Site Map</h3>
            <div className="grid grid-cols-2 gap-2">
              {siteMapLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm text-gray-600 hover:text-[#001F54] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Government */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Government</h3>
            <div className="grid grid-cols-2 gap-2">
              {governmentLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm text-gray-600 hover:text-[#001F54] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Social Links and Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-4 md:mb-0">
            <p>&copy; {currentYear} All Rights Reserved</p>
            <div className="flex gap-4 mt-2">
              <Link to="/privacy" className="hover:text-[#001F54]">Privacy Policy</Link>
              <span>|</span>
              <Link to="/terms" className="hover:text-[#001F54]">Site Info</Link>
              <span>|</span>
              <Link to="/disclaimer" className="hover:text-[#001F54]">Sitemap</Link>
            </div>
          </div>

          {/* Follow Us */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Follow Us</p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-bold hover:bg-[#001F54] transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
