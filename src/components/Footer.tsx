import { Link } from "react-router-dom";
import { Heart, Shield, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/patients", label: "For Patients" },
    { href: "/donors", label: "For Donors" },
    { href: "/contact", label: "Contact" },
  ];

  const legalLinks = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/compliance", label: "HIPAA Compliance" },
    { href: "/security", label: "Security" },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                TransplantChain
              </span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Revolutionizing organ transplant tracking through blockchain technology. 
              Building trust, transparency, and saving lives.
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-blockchain" />
              <span>Blockchain Secured</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal & Compliance</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-sm">support@transplantchain.org</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-sm">+1 (555) 123-ORGAN</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm">Healthcare Innovation Center</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">
            © 2024 TransplantChain. All rights reserved. Built for saving lives.
          </p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>HIPAA Compliant</span>
            <span>•</span>
            <span>Blockchain Verified</span>
            <span>•</span>
            <span>FDA Approved Process</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;