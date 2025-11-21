
import React, { useState, useEffect } from 'react';
import { Sprout, Menu, X, ArrowRight, UserCircle, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface NavBarProps {
  onNavigate: (page: any) => void;
  currentPage: any;
}

const NavBar: React.FC<NavBarProps> = ({ onNavigate, currentPage }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navClass = scrolled || currentPage !== 'home'
    ? 'bg-white/90 backdrop-blur-md shadow-sm text-stone-800'
    : 'bg-transparent text-white';

  const buttonClass = scrolled || currentPage !== 'home'
    ? 'text-stone-600 hover:text-emerald-600'
    : 'text-white/90 hover:text-white';

  const logoColor = scrolled || currentPage !== 'home' ? 'text-emerald-600' : 'text-white';

  const toggleLanguage = () => {
    if (language === 'en') setLanguage('hi');
    else if (language === 'hi') setLanguage('bn');
    else setLanguage('en');
  };

  const getLangLabel = () => {
    if (language === 'en') return 'ENG';
    if (language === 'hi') return 'हिंदी';
    return 'বাংলা';
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer group" onClick={() => onNavigate('home')}>
            <div className={`mr-2 transition-transform group-hover:scale-110 duration-300 ${logoColor}`}>
              <Sprout className="h-8 w-8" strokeWidth={2.5} />
            </div>
            <span className={`font-bold text-2xl tracking-tight ${scrolled || currentPage !== 'home' ? 'text-stone-900' : 'text-white'}`}>
              CropShield
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => onNavigate('home')} 
              className={`text-sm font-medium transition-colors ${buttonClass}`}
            >
              {t('nav.home')}
            </button>
            <button 
              onClick={() => onNavigate('detect')} 
              className={`text-sm font-medium transition-colors ${buttonClass}`}
            >
              {t('nav.analyze')}
            </button>

            {/* Language Switcher */}
            <button 
                onClick={toggleLanguage}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wide transition-all
                ${scrolled || currentPage !== 'home' 
                    ? 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100' 
                    : 'border-white/30 bg-white/10 text-white hover:bg-white/20'}`}
            >
                <Globe size={12} />
                {getLangLabel()}
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onNavigate('profile')}
                  className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors text-stone-800 font-medium text-sm"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-stone-200" />
                  ) : (
                    <UserCircle className="w-8 h-8 text-stone-400" />
                  )}
                  <span>{user.name.split(' ')[0]}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                 <button 
                  onClick={() => onNavigate('login')} 
                  className={`text-sm font-medium transition-colors ${buttonClass}`}
                >
                  {t('nav.login')}
                </button>
                <button 
                  onClick={() => onNavigate('signup')} 
                  className="group flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg hover:shadow-emerald-500/30 active:scale-95"
                >
                  {t('nav.signup')}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden gap-4 items-center">
             <button 
                onClick={toggleLanguage}
                className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-bold uppercase tracking-wide
                ${scrolled || currentPage !== 'home' 
                    ? 'border-stone-200 bg-stone-50 text-stone-600' 
                    : 'border-white/30 bg-white/10 text-white'}`}
            >
                {getLangLabel()}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none ${scrolled || currentPage !== 'home' ? 'text-stone-800' : 'text-white'}`}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 shadow-xl absolute w-full">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <button onClick={() => { onNavigate('home'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-3 text-base font-medium text-stone-600 hover:bg-stone-50 rounded-lg">{t('nav.home')}</button>
            <button onClick={() => { onNavigate('detect'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-3 text-base font-medium text-stone-600 hover:bg-stone-50 rounded-lg">{t('nav.analyze')}</button>
            
            {user ? (
              <>
                <button onClick={() => { onNavigate('profile'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-3 text-base font-medium text-emerald-600 bg-emerald-50 rounded-lg">{t('nav.profile')}</button>
                <button onClick={() => { logout(); onNavigate('home'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-3 text-base font-medium text-red-500 hover:bg-red-50 rounded-lg">{t('nav.logout')}</button>
              </>
            ) : (
              <>
                <button onClick={() => { onNavigate('login'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-3 text-base font-medium text-stone-600 hover:bg-stone-50 rounded-lg">{t('nav.login')}</button>
                <button onClick={() => { onNavigate('signup'); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-3 text-base font-medium text-emerald-600 bg-emerald-50 rounded-lg">{t('nav.signup')}</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
