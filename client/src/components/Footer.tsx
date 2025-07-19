import { Link } from 'wouter';
import { Facebook, Twitter, Instagram, Linkedin, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const serviceLinks = [
    { href: '/services?category=home', label: 'Home Cleaning' },
    { href: '/services?category=ac', label: 'AC Cleaning' },
    { href: '/services?category=office', label: 'Office Cleaning' },
    { href: '/services?category=deep', label: 'Deep Cleaning' },
    { href: '/services?category=carpet', label: 'Carpet Cleaning' },
  ];

  const locationLinks = [
    { href: '/services?city=doha', label: 'Doha' },
    { href: '/services?city=al-rayyan', label: 'Al Rayyan' },
    { href: '/services?city=al-wakrah', label: 'Al Wakrah' },
    { href: '/services?city=umm-salal', label: 'Umm Salal' },
  ];

  const socialLinks = [
    { href: '#', icon: Facebook, label: 'Facebook' },
    { href: '#', icon: Twitter, label: 'Twitter' },
    { href: '#', icon: Instagram, label: 'Instagram' },
    { href: '#', icon: Linkedin, label: 'LinkedIn' },
  ];

  return (
    <footer className="footer-bg text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img 
                src="/assets/panaromalogo_1752964145363.png" 
                alt="Panaroma Facilities Management" 
                className="w-[240px] h-[160px] object-contain"
              />
            </div>
            <p className="text-gray-300 mb-4">
              Excellence in facilities management and cleaning services across Qatar. Licensed, insured, and trusted by thousands.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="social-icon"
                  aria-label={link.label}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-300">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Locations</h4>
            <ul className="space-y-2 text-gray-300">
              {locationLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span>+974 4444 5555</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span>info@panaroma.qa</span>
              </li>
              <li className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>Doha, Qatar</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {currentYear} Panaroma Facilities Management. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
