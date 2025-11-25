'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
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
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission (dummy for now)
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="font-sans antialiased text-gray-800 min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="shrink-0 flex items-center group">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-r from-teal-600 to-emerald-600 rounded-xl flex items-center justify-center mr-2 sm:mr-3">
                  <Recycle className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-lg sm:text-2xl font-bold bg-linear-to-r from-teal-700 via-teal-600 to-emerald-500 bg-clip-text text-transparent">SmartScrap</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-gray-700 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Home</span>
              </Link>
              <Link href="/dashboard" className="bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-3 py-2 sm:px-6 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-linear-to-r from-teal-700 via-teal-600 to-emerald-500 text-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">Get in Touch</h1>
          <p className="text-base sm:text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Have questions or feedback? We&apos;d love to hear from you. Reach out to us and we&apos;ll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <p className="text-gray-600 mb-8">
                  Fill out the form and our team will get back to you within 24 hours.
                </p>
              </div>

              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start space-x-4 group">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-linear-to-r from-teal-100 to-emerald-100 text-teal-600 group-hover:from-teal-600 group-hover:to-emerald-600 group-hover:text-white transition-all duration-300">
                      <Mail className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-1">Email</h4>
                    <a href="mailto:info@smartscrap.com" className="text-gray-600 hover:text-teal-600 transition-colors">
                      info@smartscrap.com
                    </a>
                    <p className="text-sm text-gray-500 mt-1">support@smartscrap.com</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start space-x-4 group">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-linear-to-r from-teal-100 to-emerald-100 text-teal-600 group-hover:from-teal-600 group-hover:to-emerald-600 group-hover:text-white transition-all duration-300">
                      <Phone className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-1">Phone</h4>
                    <a href="tel:+919000300059" className="text-gray-600 hover:text-teal-600 transition-colors">
                      +91 9000 300 059
                    </a>
                    <p className="text-sm text-gray-500 mt-1">+91 8500 200 150</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start space-x-4 group">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-linear-to-r from-teal-100 to-emerald-100 text-teal-600 group-hover:from-teal-600 group-hover:to-emerald-600 group-hover:text-white transition-all duration-300">
                      <MapPin className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-1">Office Address</h4>
                    <p className="text-gray-600">
                      SmartScrap Technologies<br />
                      HITEC City, Madhapur<br />
                      Hyderabad, Telangana 500081<br />
                      India
                    </p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start space-x-4 group">
                  <div className="shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-linear-to-r from-teal-100 to-emerald-100 text-teal-600 group-hover:from-teal-600 group-hover:to-emerald-600 group-hover:text-white transition-all duration-300">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-1">Business Hours</h4>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Follow Us</h4>
                <div className="flex space-x-3">
                  {[
                    { Icon: Facebook, link: '#', label: 'Facebook' },
                    { Icon: Twitter, link: '#', label: 'Twitter' },
                    { Icon: Instagram, link: '#', label: 'Instagram' },
                    { Icon: Linkedin, link: '#', label: 'LinkedIn' }
                  ].map(({ Icon, link, label }) => (
                    <a
                      key={label}
                      href={link}
                      aria-label={label}
                      className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-teal-600 hover:text-white transition-all duration-300 transform hover:scale-110"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-2xl">
                <CardHeader className="space-y-3">
                  <CardTitle className="text-2xl sm:text-3xl font-bold">Send Us a Message</CardTitle>
                  <CardDescription className="text-base text-gray-600">We'll get back to you within 24 hours</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 9000 000 000"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="How can we help?"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 resize-none"
                      placeholder="Tell us more about your inquiry..."
                    ></textarea>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 h-auto py-4"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </Button>
                </form>
                </CardContent>
              </Card>

              {/* Additional Info Cards */}
             
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
