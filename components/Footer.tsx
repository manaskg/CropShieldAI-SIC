import React from 'react';
import { Sprout, Heart, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-400 pt-16 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Sprout className="h-8 w-8 text-emerald-500 mr-2" />
              <span className="font-bold text-xl text-stone-100">CropShield</span>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed">
              Empowering farmers with AI-driven diagnostics and weather-smart protection plans for a sustainable future.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-stone-100 font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">How it Works</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Success Stories</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-stone-100 font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-stone-100 font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-stone-500 hover:text-emerald-400 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-stone-500 hover:text-emerald-400 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-stone-500 hover:text-emerald-400 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-stone-500 hover:text-emerald-400 transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-red-500 fill-current" /> for farmers worldwide
          </p>
          <p className="mt-2 md:mt-0">© 2025 CropShield Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;