import React from 'react'

export default function Footer() {
    return (
        <footer className="px-[3%] relative bg-gradient-to-br from-white via-neutral-50 to-white text-neutral-900 overflow-hidden">
            {/* Background Pattern */}
            <div className=" absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-400/5 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10 max-w-8xl mx-auto px-8 py-20">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-28  mb-12">
                    {/* Company Info */}
                    <div className="lg:col-span-1">
                        <div className="mb-8">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mr-4">
                                    <span className="text-2xl font-bold text-white">A</span>
                                </div>
                                <h3 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent">
                                    Amacar
                                </h3>
                            </div>
                            <p className="text-neutral-600 leading-relaxed mb-8 text-lg">
                                The smartest way to sell your car. Get instant offers from verified dealers
                                and watch them compete for your vehicle in real-time auctions.
                            </p>
                            
                            {/* Social Links */}
                            <div className="flex space-x-4">
                                <a href="#" className="group w-12 h-12 bg-neutral-100 hover:bg-primary-500 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-glow">
                                    <span className="text-lg font-bold text-neutral-600 group-hover:text-white">f</span>
                                </a>
                                <a href="#" className="group w-12 h-12 bg-neutral-100 hover:bg-primary-500 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-glow">
                                    <span className="text-lg font-bold text-neutral-600 group-hover:text-white">t</span>
                                </a>
                                <a href="#" className="group w-12 h-12 bg-neutral-100 hover:bg-primary-500 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-glow">
                                    <span className="text-lg font-bold text-neutral-600 group-hover:text-white">in</span>
                                </a>
                                <a href="#" className="group w-12 h-12 bg-neutral-100 hover:bg-primary-500 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-glow">
                                    <span className="text-lg font-bold text-neutral-600 group-hover:text-white">p</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-xl font-semibold mb-8 text-neutral-900">Quick Links</h4>
                        <ul className="space-y-4">
                            <li>
                                <a href="#" className="text-neutral-600 hover:text-primary-500 transition-colors duration-300 text-lg  inline-block">
                                    How It Works
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-neutral-600 hover:text-primary-500 transition-colors duration-300 text-lg  inline-block">
                                    Get Instant Offer
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-neutral-600 hover:text-primary-500 transition-colors duration-300 text-lg  inline-block">
                                    Start Auction
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-neutral-600 hover:text-primary-500 transition-colors duration-300 text-lg  inline-block">
                                    Success Stories
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-xl font-semibold mb-8 text-neutral-900">Services</h4>
                        <ul className="space-y-4">
                            <li>
                                <a href="#" className="text-neutral-600 hover:text-primary-500 transition-colors duration-300 text-lg  inline-block">
                                    Car Valuation
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-neutral-600 hover:text-primary-500 transition-colors duration-300 text-lg  inline-block">
                                    Vehicle Inspection
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-neutral-600 hover:text-primary-500 transition-colors duration-300 text-lg  inline-block">
                                    Documentation Help
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-neutral-600 hover:text-primary-500 transition-colors duration-300 text-lg  inline-block">
                                    Payment Processing
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Support & Legal */}
                    <div>
                        <h4 className="text-xl font-semibold mb-8 text-neutral-900">Support & Legal</h4>
                        <ul className="space-y-4">
                            <li>
                                <a href="#" className="text-neutral-600 hover:text-primary-500 transition-colors duration-300 text-lg  inline-block">
                                    Contact Us
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-neutral-600 hover:text-primary-500 transition-colors duration-300 text-lg  inline-block">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-neutral-600 hover:text-primary-500 transition-colors duration-300 text-lg  inline-block">
                                    Terms of Service
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-neutral-600 hover:text-primary-500 transition-colors duration-300 text-lg  inline-block">
                                    FAQ
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="border-t border-neutral-300 pt-8 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex items-center space-x-4 group">
                            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <span className="text-2xl">📞</span>
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500 uppercase tracking-wide">Call Us</p>
                                <p className="font-semibold text-lg text-neutral-900">+91 98765 43210</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 group">
                            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <span className="text-2xl">✉️</span>
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500 uppercase tracking-wide">Email Us</p>
                                <p className="font-semibold text-lg text-neutral-900">support@amacar.com</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 group">
                            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <span className="text-2xl">📍</span>
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500 uppercase tracking-wide">Visit Us</p>
                                <p className="font-semibold text-lg text-neutral-900">Mumbai, Maharashtra</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-neutral-300 pt-8">
                    <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
                        <div className="text-neutral-600 text-lg">
                            © 2024 Amacar. All rights reserved. | Made with ❤️ in India
                        </div>
                        <div className="flex items-center space-x-8">
                            <span className="text-neutral-600 text-lg">Trusted by</span>
                            <div className="flex items-center space-x-4">
                                <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 backdrop-blur-sm border border-primary-500/20 px-4 py-2 rounded-full text-sm font-medium text-primary-600">
                                    10,000+ Sellers
                                </div>
                                <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 backdrop-blur-sm border border-primary-500/20 px-4 py-2 rounded-full text-sm font-medium text-primary-600">
                                    500+ Dealers
                                </div>
                               
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
