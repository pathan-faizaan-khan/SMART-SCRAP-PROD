import React from 'react'
import { 
  Recycle, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  ArrowLeft,
  Send
} from 'lucide-react';
import Link from 'next/link';

const footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-linear-to-r from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
                  <Recycle className="text-white w-5 h-5" />
                </div>
                <span className="text-2xl font-bold bg-linear-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">SmartScrap</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Making waste management smart, profitable, and sustainable for everyone.
              </p>
              <div className="flex space-x-4">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                  <a key={idx} href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-teal-600 transition-colors duration-300">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {[
                  { name: 'Home', href: '/' },
                  { name: 'Features', href: '/#features' },
                  { name: 'How It Works', href: '/#how-it-works' },
                  { name: 'For Businesses', href: '/#businesses' }
                ].map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-400 hover:text-white transition-colors duration-300">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                {['Blog', 'FAQs', 'Recycling Guide', 'Pricing'].map((resource) => (
                  <li key={resource}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">{resource}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">© 2025 SmartScrap. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
  )
}
export default footer
