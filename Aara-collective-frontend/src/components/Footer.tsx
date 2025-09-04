import React from "react";
import { Link } from "react-router-dom";
import {
  InstagramIcon,
  FacebookIcon,
  TwitterIcon,
  YoutubeIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
} from "lucide-react";

const Footer = () => {
  return (
    // Footer uses a pink gradient background
    <footer className="bg-gradient-to-b from-pink-600 via-pink-700 to-pink-800 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Organizes the footer into 4 columns on large screens. */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About Section with social media icons*/}
          <div>
            <h2 className="text-xl font-semibold text-gold-300 mb-4 tracking-wide">
              Aara Collective
            </h2>
            <p className="text-gray-200 mb-6 leading-relaxed">
              Authentic Indian jewelry, clothing, and footwear—bringing the rich
              cultural heritage of India to the global stage.
            </p>
            {/* Create a horizontal row of social media icons - each icon is clickable. Uses Flexbox to lay out the icons side by side. Adds horizontal spacing (space-x-4) between each icon.*/}
            
            <div className="flex space-x-4">
              {[InstagramIcon, FacebookIcon, TwitterIcon, YoutubeIcon].map(
                (Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="text-gold-200 hover:text-gold-100 transition-colors duration-200"
                  >
                    <Icon size={22} />
                  </a>
                ),
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gold-300 tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: "About Us", path: "/about" },
                { label: "Blog", path: "/blog" },
                { label: "Contact", path: "/contact" },
                { label: "FAQs", path: "/faqs" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-200 hover:text-gold-200 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gold-300 tracking-wide">
              Customer Service
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Return Policy", path: "/return-policy" },
                { label: "Privacy Policy", path: "/privacy-policy" },
                { label: "Terms & Conditions", path: "/terms" },
                { label: "My Account", path: "/dashboard" },
                { label: "Wishlist", path: "/wishlist" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-200 hover:text-gold-200 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gold-300 tracking-wide">
              Contact Us
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start">
                <MapPinIcon size={20} className="mt-1 mr-3 text-gold-400" />
                <span className="text-gray-200 leading-relaxed">
                  Woodlands Ave 1, Singapore
                </span>
              </li>
              <li className="flex items-center">
                <PhoneIcon size={20} className="mr-3 text-gold-400" />
                <span className="text-gray-200">+65 8888 8888</span>
              </li>
              <li className="flex items-center">
                <MailIcon size={20} className="mr-3 text-gold-400" />
                <span className="text-gray-200">Anna@aaracollective.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-gray-800 pt-6 text-center text-gray-200 text-xs tracking-wide">
          &copy; {new Date().getFullYear()} Aara Collective. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
