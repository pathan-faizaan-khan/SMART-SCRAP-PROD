'use client';

import Image from "next/image";
import Link from "next/link";
import { 
  Home as HomeIcon, 
  Building2, 
  Search, 
  Shield, 
  Recycle,
  Leaf, 
  Users, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  ChartLine, 
  HandCoins, 
  Box, 
  Newspaper, 
  Laptop, 
  Wrench, 
  Wine, 
  Shirt, 
  TreePine, 
  Menu
} from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="font-sans antialiased text-gray-800">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="shrink-0 flex items-center">
                <Image 
                  src="/logo.png" 
                  alt="SmartScrap Logo" 
                  width={40} 
                  height={40} 
                  className="w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3"
                />
                <span className="text-lg sm:text-2xl font-bold bg-linear-to-r from-teal-700 via-teal-600 to-emerald-500 bg-clip-text text-transparent">SmartScrap</span>
              </div>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
              <a href="#features" className="text-gray-700 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors duration-200">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors duration-200">How It Works</a>
              <a href="#materials" className="text-gray-700 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors duration-200">Materials</a>
              <a href="#businesses" className="text-gray-700 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors duration-200">For Businesses</a>
              <Link href="/contact" className="text-gray-700 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors duration-200">Contact</Link>
            </div>
            <div className="flex items-center">
              <Link href="/dashboard" className="bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-3 py-2 sm:px-6 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
                Get Started
              </Link>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden ml-2 sm:ml-4 inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-teal-600"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded-md text-base font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="block px-3 py-2 text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded-md text-base font-medium" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
              <a href="#materials" className="block px-3 py-2 text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded-md text-base font-medium" onClick={() => setMobileMenuOpen(false)}>Materials</a>
              <a href="#businesses" className="block px-3 py-2 text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded-md text-base font-medium" onClick={() => setMobileMenuOpen(false)}>For Businesses</a>
              <Link href="/contact" className="block px-3 py-2 text-gray-700 hover:text-teal-600 hover:bg-gray-50 rounded-md text-base font-medium" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-linear-to-r from-teal-700 via-teal-600 to-emerald-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white/20 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-white/10 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 md:py-32 relative z-10">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6">
                Turn Your Waste Into
                <span className="block bg-linear-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Value
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90 leading-relaxed">
                Connect with local recycling businesses and get the best price for your scrap materials with convenient doorstep pickup.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Link href="/dashboard" className="bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 text-center flex items-center justify-center text-sm sm:text-base">
                  <Recycle className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  Sell Your Scrap
                </Link>
                <button className="bg-white/20 border-2 border-white/30 hover:bg-white/30 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-sm sm:text-base">
                  <Building2 className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  For Businesses
                </button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-lg">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl transform rotate-0 sm:rotate-3 hover:rotate-0 transition-transform duration-500">
                  <Image 
                    src="/image.png" 
                    alt="Waste Management" 
                    width={600} 
                    height={400} 
                    className="w-full h-auto"
                    priority
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="bg-linear-to-b from-gray-50 to-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Why Choose SmartScrap</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              We make recycling easy, profitable, and convenient for everyone involved
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-linear-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-linear-to-r from-teal-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <HomeIcon className="text-teal-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Doorstep Pickup</h3>
              <p className="text-gray-600 leading-relaxed">No need to haul your scrap materials. Recycling businesses come to you for convenient collection.</p>
            </div>
            
            <div className="bg-linear-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-linear-to-r from-teal-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <Search className="text-teal-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Best Price Guarantee</h3>
              <p className="text-gray-600 leading-relaxed">Compare prices from multiple recycling businesses and choose the best offer for your materials.</p>
            </div>
            
            <div className="bg-linear-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-linear-to-r from-teal-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="text-teal-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Secure Transactions</h3>
              <p className="text-gray-600 leading-relaxed">Safe and transparent payment methods to ensure you get paid for your recyclable materials.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Key Features</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Advanced features designed to make waste management efficient and profitable
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="shrink-0 w-12 h-12 bg-linear-to-r from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Leaf className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Environmental Impact</h3>
                  <p className="text-gray-600">Reduce carbon footprint through optimized collection routes and increased recycling rates.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="shrink-0 w-12 h-12 bg-linear-to-r from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Users className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Easy Connection</h3>
                  <p className="text-gray-600">Connect households, businesses, and recycling facilities in one convenient platform.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="shrink-0 w-12 h-12 bg-linear-to-r from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Track Your Impact</h3>
                  <p className="text-gray-600">Monitor your environmental contribution and earnings through detailed analytics.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-linear-to-r from-teal-50 to-emerald-50 rounded-3xl p-8 border border-teal-100">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-linear-to-r from-teal-500 to-emerald-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Recycle className="text-white w-8 h-8" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Smart Categorization</h4>
                  <p className="text-sm text-gray-600">Easy material identification</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-linear-to-r from-teal-500 to-emerald-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Clock className="text-white w-8 h-8" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Real-time Updates</h4>
                  <p className="text-sm text-gray-600">Live pickup status tracking</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-linear-to-r from-teal-500 to-emerald-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Shield className="text-white w-8 h-8" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Secure Platform</h4>
                  <p className="text-sm text-gray-600">Protected transactions</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-linear-to-r from-teal-500 to-emerald-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <DollarSign className="text-white w-8 h-8" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Fair Pricing</h4>
                  <p className="text-sm text-gray-600">Competitive market rates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-20 bg-linear-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">How SmartScrap Works</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Selling your scrap has never been easier. Just follow these simple steps
            </p>
          </div>
          
          <div className="relative">
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-linear-to-r from-teal-500 to-emerald-500 rounded-full"></div>
            
            <div className="grid lg:grid-cols-4 gap-8 relative">
              {[
                { num: 1, title: 'List Your Scrap', desc: 'Tell us what materials you have available and their approximate quantity.' },
                { num: 2, title: 'Receive Offers', desc: 'Local recycling businesses will send you their best prices for your materials.' },
                { num: 3, title: 'Schedule Pickup', desc: 'Choose the offer you prefer and schedule a convenient pickup time.' },
                { num: 4, title: 'Get Paid', desc: 'The business collects your materials and you receive payment securely.' }
              ].map((step) => (
                <div key={step.num} className="text-center relative">
                  <div className="w-16 h-16 bg-linear-to-r from-teal-500 to-emerald-500 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white text-xl font-bold shadow-lg relative z-10">
                    {step.num}
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">{step.title}</h3>
                    <p className="text-gray-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Materials Section */}
      <section id="materials" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Materials We Handle</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              We connect you with businesses that recycle various types of materials
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Recycle, name: 'Plastic', desc: 'PET, HDPE, containers', color: 'from-blue-50 to-blue-100', iconColor: 'text-blue-600', hoverColor: 'from-blue-500 to-blue-600' },
              { icon: Box, name: 'Cardboard', desc: 'Corrugated, packaging', color: 'from-yellow-50 to-yellow-100', iconColor: 'text-yellow-600', hoverColor: 'from-yellow-500 to-yellow-600' },
              { icon: Newspaper, name: 'Paper', desc: 'Office, newspaper, magazines', color: 'from-green-50 to-green-100', iconColor: 'text-green-600', hoverColor: 'from-green-500 to-green-600' },
              { icon: Laptop, name: 'Electronics', desc: 'Devices, batteries, cables', color: 'from-purple-50 to-purple-100', iconColor: 'text-purple-600', hoverColor: 'from-purple-500 to-purple-600' },
              { icon: Wrench, name: 'Metal', desc: 'Aluminum, steel, copper', color: 'from-gray-50 to-gray-100', iconColor: 'text-gray-600', hoverColor: 'from-gray-500 to-gray-600' },
              { icon: Wine, name: 'Glass', desc: 'Bottles, containers, jars', color: 'from-indigo-50 to-indigo-100', iconColor: 'text-indigo-600', hoverColor: 'from-indigo-500 to-indigo-600' },
              { icon: Shirt, name: 'Textiles', desc: 'Clothing, fabrics, linens', color: 'from-pink-50 to-pink-100', iconColor: 'text-pink-600', hoverColor: 'from-pink-500 to-pink-600' },
              { icon: TreePine, name: 'Wood', desc: 'Pallets, furniture, lumber', color: 'from-amber-50 to-amber-100', iconColor: 'text-amber-600', hoverColor: 'from-amber-500 to-amber-600' }
            ].map((material, idx) => {
              const IconComponent = material.icon;
              return (
                <div key={idx} className={`group relative bg-linear-to-br ${material.color} p-6 rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}>
                  <div className={`absolute inset-0 bg-linear-to-br ${material.hoverColor} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <IconComponent className={`${material.iconColor} w-10 h-10 mb-4 relative z-10`} />
                  <h3 className="font-semibold mb-2 text-gray-900 relative z-10">{material.name}</h3>
                  <p className="text-gray-600 text-sm relative z-10">{material.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* For Businesses Section */}
      <section id="businesses" className="py-12 sm:py-16 md:py-20 bg-linear-to-r from-teal-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:space-x-12">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">For Recycling Businesses</h2>
              <p className="text-gray-600 mb-6 text-lg">
                Join our network of recycling partners and gain access to a steady stream of quality scrap materials from local households and businesses.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Expand your supplier network without additional marketing costs',
                  'Competitive bidding system ensures fair market prices',
                  'Easy scheduling and route optimization for collections'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle2 className="text-teal-600 mt-1 mr-3 w-5 h-5 shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <button className="bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                Register Your Business
              </button>
            </div>
            <div className="md:w-1/2">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-2xl font-semibold mb-6 text-gray-900">Business Benefits</h3>
                <div className="space-y-6">
                  {[
                    { icon: ChartLine, title: 'Increased Supply', desc: 'Access to more scrap materials from residential sources.' },
                    { icon: Clock, title: 'Time Savings', desc: 'Efficient scheduling reduces wasted trips and downtime.' },
                    { icon: HandCoins, title: 'Fair Pricing', desc: 'Competitive but fair market pricing for quality materials.' }
                  ].map((benefit, idx) => {
                    const IconComponent = benefit.icon;
                    return (
                      <div key={idx} className="flex items-start">
                        <div className="shrink-0">
                          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-linear-to-r from-teal-100 to-emerald-100 text-teal-600">
                            <IconComponent className="w-6 h-6" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-gray-900">{benefit.title}</h4>
                          <p className="mt-1 text-gray-600">{benefit.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-linear-to-r from-teal-700 via-teal-600 to-emerald-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-white/20 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Ready to Turn Your Waste Into Value?</h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-3xl mx-auto opacity-90 leading-relaxed px-4">
            Join the SmartScrap community today and start earning from your recyclable materials.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 md:space-x-6">
            <Link href="/dashboard" className="bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-xl font-medium text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center">
              <Recycle className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5" />
              Start Selling Now
            </Link>
            <button className="bg-white/20 border-2 border-white/30 hover:bg-white/30 px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-xl font-medium text-sm sm:text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center">
              <Building2 className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5" />
              For Businesses
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
