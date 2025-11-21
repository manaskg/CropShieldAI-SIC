
import React, { useEffect, useState } from 'react';
import { Sprout, ShieldCheck, Smartphone, ArrowRight, CloudSun, ScanLine, CheckCircle2, PlayCircle, Leaf, TrendingUp, Users, AlertTriangle, Languages, WifiOff, IndianRupee, ShoppingBag, Star, MessageCircle, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HomeProps {
  onNavigate: (page: 'detect') => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { t, isIndic } = useLanguage();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('opacity-0');
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`flex flex-col min-h-screen ${isIndic ? 'font-bengali' : 'font-sans'}`}>
      
      {/* --- Hero Section --- */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-stone-900 pt-20">
        
        <div className="absolute inset-0 z-0">
           <img 
             src="https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?q=80&w=1920&auto=format&fit=crop"
             alt="Farmer holding crop leaf in field"
             className="w-full h-full object-cover opacity-80"
           />
           <div className="absolute inset-0 bg-stone-900/80"></div>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center justify-center text-center">
          
          <div className="space-y-8 animate-fade-in-up">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wider uppercase shadow-lg mx-auto">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {t('hero.badge')}
             </div>

             <h1 className="text-5xl md:text-7xl font-bold text-white leading-none tracking-tight drop-shadow-lg">
                {t('hero.title.1')} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-orange-300">{t('hero.title.2')}</span>
             </h1>
             
             <p className="text-xl text-stone-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
               {t('hero.subtitle')}
             </p>

             <div className="flex flex-col sm:flex-row items-center gap-5 justify-center pt-4">
                <button 
                  onClick={() => onNavigate('detect')}
                  className="group relative px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-full text-lg transition-all shadow-[0_0_40px_-10px_rgba(16,185,129,0.6)] hover:shadow-[0_0_60px_-10px_rgba(16,185,129,0.8)] hover:-translate-y-1 active:scale-95 flex items-center gap-3 overflow-hidden"
                >
                  <span className="relative z-10">{t('hero.cta.detect')}</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                
                <button className="group px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-full backdrop-blur-sm border border-white/20 transition-all flex items-center gap-3 hover:border-white/40">
                  <PlayCircle className="w-6 h-6 text-emerald-300 group-hover:scale-110 transition-transform" />
                  {t('hero.cta.demo')}
                </button>
             </div>

             <div className="pt-8 flex items-center justify-center gap-8 border-t border-white/10 mt-8">
                <div className="text-center">
                   <div className="text-2xl font-bold text-white">98%</div>
                   <div className="text-xs text-stone-400 uppercase tracking-wider">{t('hero.stat.accuracy')}</div>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="text-center">
                   <div className="text-2xl font-bold text-white">50k+</div>
                   <div className="text-xs text-stone-400 uppercase tracking-wider">{t('hero.stat.farmers')}</div>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="text-center">
                   <div className="text-2xl font-bold text-white">Free</div>
                   <div className="text-xs text-stone-400 uppercase tracking-wider">{t('hero.stat.access')}</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- Feature Strip (Marquee) --- */}
      <div className="bg-emerald-900 text-white py-6 overflow-hidden whitespace-nowrap z-20 relative">
        <div className="flex items-center animate-marquee opacity-90 hover:opacity-100 transition-opacity duration-300">
           <div className="flex items-center gap-16 pr-16">
             {[1,2,3,4].map(i => (
                <div key={`g1-${i}`} className="flex items-center gap-4 text-lg font-medium tracking-wide">
                   <Sprout className="text-emerald-400" /> {t('feat.detect')}
                   <span className="text-emerald-700">•</span>
                   <CloudSun className="text-emerald-400" /> {t('feat.weather')}
                   <span className="text-emerald-700">•</span>
                   <ShieldCheck className="text-emerald-400" /> {t('feat.protect')}
                   <span className="text-emerald-700">•</span>
                </div>
             ))}
           </div>
           <div className="flex items-center gap-16 pr-16">
             {[1,2,3,4].map(i => (
                <div key={`g2-${i}`} className="flex items-center gap-4 text-lg font-medium tracking-wide">
                   <Sprout className="text-emerald-400" /> {t('feat.detect')}
                   <span className="text-emerald-700">•</span>
                   <CloudSun className="text-emerald-400" /> {t('feat.weather')}
                   <span className="text-emerald-700">•</span>
                   <ShieldCheck className="text-emerald-400" /> {t('feat.protect')}
                   <span className="text-emerald-700">•</span>
                </div>
             ))}
           </div>
        </div>
      </div>

      {/* --- Bento Grid Features Section (Why Us) --- */}
      <section className="py-24 bg-stone-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16 animate-on-scroll opacity-0 transition-all duration-700">
              <h2 className="text-3xl md:text-5xl font-bold text-stone-900 mb-4">{t('why.title')}</h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto">{t('why.subtitle')}</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Feature 1: Language (Large) */}
              <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-xl shadow-stone-200/50 border border-stone-100 relative overflow-hidden group animate-on-scroll opacity-0 transition-all duration-700">
                 <div className="absolute top-0 right-0 bg-gradient-to-bl from-emerald-100 to-transparent w-48 h-48 rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                 <div className="relative z-10">
                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                       <Languages size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-stone-900 mb-3">{t('why.1.title')}</h3>
                    <p className="text-stone-600 leading-relaxed mb-6 max-w-md">{t('why.1.desc')}</p>
                    
                    {/* Visual representation of language switching */}
                    <div className="flex gap-3">
                       <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-bold border border-stone-200">English</span>
                       <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">हिंदी</span>
                       <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">বাংলা</span>
                       <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-400 text-xs font-bold border border-stone-200">+ More</span>
                    </div>
                 </div>
              </div>

              {/* Feature 2: Offline (Tall) */}
              <div className="bg-stone-900 text-white rounded-3xl p-8 shadow-xl shadow-stone-900/20 relative overflow-hidden group animate-on-scroll opacity-0 transition-all duration-700 delay-100">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                 <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6 group-hover:bg-white group-hover:text-stone-900 transition-colors duration-300">
                           <WifiOff size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">{t('why.2.title')}</h3>
                        <p className="text-stone-400 leading-relaxed">{t('why.2.desc')}</p>
                    </div>
                    <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-mono text-green-400">4G CONNECTION: STABLE</span>
                        </div>
                    </div>
                 </div>
              </div>

              {/* Feature 3: Cost (Medium) */}
              <div className="bg-amber-50 rounded-3xl p-8 shadow-xl shadow-amber-100/50 border border-amber-100 group animate-on-scroll opacity-0 transition-all duration-700 delay-200">
                 <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                    <IndianRupee size={28} />
                 </div>
                 <h3 className="text-2xl font-bold text-stone-900 mb-3">{t('why.3.title')}</h3>
                 <p className="text-stone-600 leading-relaxed">{t('why.3.desc')}</p>
              </div>

              {/* Feature 4: Genuine Products (Wide) */}
              <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-xl shadow-stone-200/50 border border-stone-100 flex flex-col md:flex-row items-center gap-8 animate-on-scroll opacity-0 transition-all duration-700 delay-300">
                 <div className="flex-1">
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 hover:bg-blue-600 hover:text-white transition-colors duration-300">
                       <ShoppingBag size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-stone-900 mb-3">{t('why.4.title')}</h3>
                    <p className="text-stone-600 leading-relaxed">{t('why.4.desc')}</p>
                 </div>
                 <div className="flex-1 w-full bg-stone-50 rounded-xl p-4 border border-stone-100">
                     <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-stone-100">
                            <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle2 size={16}/></div>
                            <div className="flex-1">
                                <div className="h-2 w-24 bg-stone-200 rounded mb-1"></div>
                                <div className="h-2 w-16 bg-stone-100 rounded"></div>
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">VERIFIED</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-stone-100 opacity-60">
                            <div className="bg-stone-100 p-2 rounded-full text-stone-400"><CheckCircle2 size={16}/></div>
                            <div className="flex-1">
                                <div className="h-2 w-20 bg-stone-200 rounded mb-1"></div>
                                <div className="h-2 w-12 bg-stone-100 rounded"></div>
                            </div>
                        </div>
                     </div>
                 </div>
              </div>

           </div>
        </div>
      </section>

      {/* --- Social Proof (Testimonials) --- */}
      <section className="py-24 bg-white border-t border-stone-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 animate-on-scroll opacity-0">
                 <div>
                     <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-2 block">Community</span>
                     <h2 className="text-4xl font-bold text-stone-900">{t('trust.title')}</h2>
                 </div>
                 <div className="flex items-center gap-2 text-stone-500">
                    <div className="flex -space-x-2">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-stone-200 flex items-center justify-center text-xs overflow-hidden">
                                <img src={`https://randomuser.me/api/portraits/men/${30+i}.jpg`} alt="User" />
                            </div>
                        ))}
                    </div>
                    <span className="ml-2 font-medium">50,000+ Farmers</span>
                 </div>
             </div>

             <div className="grid md:grid-cols-3 gap-8">
                 {[1, 2, 3].map((i) => (
                     <div key={i} className="bg-stone-50 p-8 rounded-2xl border border-stone-100 relative animate-on-scroll opacity-0 transition-all duration-700" style={{ animationDelay: `${i*150}ms` }}>
                         <div className="text-amber-400 flex gap-1 mb-4">
                             {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                         </div>
                         <p className="text-stone-700 text-lg leading-relaxed mb-6 italic">"{t(`trust.${i}.quote`)}"</p>
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-stone-200 overflow-hidden">
                                 <img src={i === 2 ? `https://randomuser.me/api/portraits/women/45.jpg` : `https://randomuser.me/api/portraits/men/${40+i}.jpg`} alt="User" className="w-full h-full object-cover" />
                             </div>
                             <div>
                                 <div className="font-bold text-stone-900">{t(`trust.${i}.name`)}</div>
                                 <div className="text-stone-500 text-sm">{t(`trust.${i}.loc`)}</div>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
         </div>
      </section>

      {/* --- Interactive Visual (App Showcase) --- */}
      <section className="py-24 bg-emerald-900 text-white overflow-hidden relative">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
         <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/10 to-transparent"></div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
             <div className="grid md:grid-cols-2 gap-16 items-center">
                 <div className="space-y-8 animate-on-scroll opacity-0">
                     <div className="inline-block bg-emerald-800 border border-emerald-700 px-4 py-1.5 rounded-full text-emerald-200 text-sm font-bold mb-4">
                        New Feature
                     </div>
                     <h2 className="text-4xl md:text-6xl font-bold leading-tight">
                        Meet <span className="text-emerald-400">Kisan Sahayak</span>
                     </h2>
                     <p className="text-xl text-emerald-100 leading-relaxed">
                        Your 24/7 AI companion. Ask questions about pests, fertilizers, or market prices just like you would ask a friend.
                     </p>
                     <ul className="space-y-4">
                        {[
                            'Instant answers in Hindi, Bengali, & English',
                            'Checks real-time market prices',
                            'Identifies deficiency from photos'
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-center gap-3 text-lg font-medium text-emerald-50">
                                <div className="bg-emerald-500 p-1 rounded-full text-white"><CheckCircle2 size={16} /></div>
                                {item}
                            </li>
                        ))}
                     </ul>
                     <button 
                        onClick={() => onNavigate('detect')}
                        className="mt-8 bg-white text-emerald-900 px-8 py-4 rounded-full font-bold hover:bg-emerald-50 transition-colors shadow-lg shadow-emerald-900/50 flex items-center gap-2"
                    >
                        <MessageCircle size={20} />
                        Chat with Kisan Sahayak
                     </button>
                 </div>

                 <div className="relative mx-auto animate-on-scroll opacity-0 transition-all duration-1000 translate-y-10">
                     {/* Phone Mockup */}
                     <div className="relative w-[300px] h-[600px] bg-stone-900 rounded-[3rem] border-8 border-stone-800 shadow-2xl overflow-hidden">
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-stone-800 rounded-b-xl z-20"></div>
                         <div className="w-full h-full bg-stone-50 flex flex-col">
                            {/* Mock Header */}
                            <div className="bg-emerald-600 p-6 pt-12 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><Sprout size={16}/></div>
                                    <span className="font-bold">Kisan Sahayak</span>
                                </div>
                            </div>
                            {/* Mock Chat */}
                            <div className="flex-1 p-4 space-y-4 overflow-hidden">
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] text-stone-800 text-sm">
                                    <p>नमस्ते! आपकी आलू की फसल में क्या समस्या है?</p>
                                </div>
                                <div className="bg-emerald-100 p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] ml-auto text-emerald-900 text-sm">
                                    <p>पत्तियों पर काले धब्बे दिख रहे हैं।</p>
                                </div>
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[90%] text-stone-800 text-sm">
                                    <div className="h-32 bg-stone-200 rounded-lg mb-2 bg-[url('https://cdn.mos.cms.futurecdn.net/aTdWJvnG8t43BaAJkFizKY-1280-80.jpg.webp')] bg-cover bg-center"></div>
                                    <p>यह <strong>Early Blight</strong> (अगेती झुलसा) है। आप <strong>Mancozeb</strong> का छिड़काव करें।</p>
                                </div>
                            </div>
                            {/* Mock Input */}
                            <div className="p-4 bg-white border-t border-stone-200">
                                <div className="h-10 bg-stone-100 rounded-full w-full"></div>
                            </div>
                         </div>
                     </div>
                     {/* Floating Elements */}
                     <div className="absolute top-1/4 -right-12 bg-white p-4 rounded-xl shadow-lg animate-float">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full text-green-600"><IndianRupee size={20}/></div>
                            <div>
                                <div className="text-xs text-stone-500 uppercase font-bold">Saved</div>
                                <div className="font-bold text-stone-900">₹ 4,500</div>
                            </div>
                        </div>
                     </div>
                 </div>
             </div>
         </div>
      </section>

      {/* --- FAQ Section --- */}
      <section className="py-20 bg-stone-50">
          <div className="max-w-3xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">{t('faq.title')}</h2>
              <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-2xl border border-stone-200 overflow-hidden transition-all">
                          <button 
                            onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                            className="w-full flex items-center justify-between p-6 text-left"
                          >
                              <span className="font-bold text-stone-800">{t(`faq.${i}.q`)}</span>
                              <ChevronDown className={`transform transition-transform text-stone-400 ${activeFaq === i ? 'rotate-180' : ''}`} />
                          </button>
                          <div className={`px-6 pb-6 text-stone-600 leading-relaxed ${activeFaq === i ? 'block' : 'hidden'}`}>
                              {t(`faq.${i}.a`)}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* --- Footer CTA --- */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto bg-stone-900 rounded-[3rem] overflow-hidden relative shadow-2xl animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">
           <div className="absolute inset-0 opacity-30">
              <img src="https://plus.unsplash.com/premium_photo-1682092792260-1b7cd1674a74?q=80&w=687&auto=format&fit=crop" alt="Field" className="w-full h-full object-cover" />
           </div>
           <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/90 to-transparent"></div>

           <div className="relative z-10 p-12 md:p-24 max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">{t('auth.join.subtitle')}</h2>
              <p className="text-stone-400 text-lg mb-8">{t('hero.subtitle')}</p>
              <button 
                onClick={() => onNavigate('detect')}
                className="px-10 py-4 bg-emerald-500 text-white font-bold rounded-full text-lg hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/30 hover:scale-105"
              >
                 {t('hero.cta.detect')}
              </button>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
