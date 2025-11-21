
import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Ruler, Wheat, Calendar, Camera, History, AlertTriangle, Sprout, LogOut, X, FileSearch } from 'lucide-react';
import ResultCard from '../components/ResultCard';
import { AnalysisResult } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ProfileProps {
  onNavigate: (page: any) => void;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
  const { user, logout, updateProfileImage } = useAuth();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedReport, setSelectedReport] = useState<AnalysisResult | null>(null);

  if (!user) {
    setTimeout(() => onNavigate('login'), 0);
    return null;
  }

  const compressImage = (base64Str: string, maxWidth = 150): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => resolve(base64Str);
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawBase64 = reader.result as string;
        const compressedBase64 = await compressImage(rawBase64);
        updateProfileImage(compressedBase64);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalScans = user.history.length;
  const detectedIssues = user.history.filter(h => h.pest.toLowerCase() !== 'healthy' && h.confidence > 0.5).length;
  const healthyCrops = totalScans - detectedIssues;

  return (
    <div className="min-h-screen bg-stone-50 py-24 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="h-32 bg-emerald-600 relative">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          </div>
          
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-6 gap-6">
              
              {/* Avatar */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-stone-100 flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-stone-300" />
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-emerald-500 text-white p-2 rounded-full shadow-md hover:bg-emerald-400 transition-colors"
                  title="Upload Photo"
                >
                  <Camera size={16} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-stone-900">{user.name}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-stone-600 text-sm">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {user.farmLocation}</span>
                  <span className="flex items-center gap-1"><Ruler size={14} /> {user.farmSize} Acres</span>
                  <span className="flex items-center gap-1"><Calendar size={14} /> Joined {formatDate(user.joinedDate).split(',')[0]}</span>
                </div>
              </div>

              {/* Actions */}
              <button 
                onClick={() => { logout(); onNavigate('home'); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
              >
                <LogOut size={16} />
                {t('nav.logout')}
              </button>
            </div>

            {/* Farm Tags */}
            <div className="flex items-center gap-2 border-t border-stone-100 pt-6">
              <Wheat size={18} className="text-emerald-600" />
              <span className="font-medium text-stone-700 mr-2">{t('auth.crops')}:</span>
              {user.primaryCrops.split(',').map((crop, i) => (
                <span key={i} className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-medium">
                  {crop.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><History size={20} /></div>
              <h3 className="text-stone-500 font-medium text-sm">{t('profile.scans')}</h3>
            </div>
            <p className="text-3xl font-bold text-stone-900">{totalScans}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertTriangle size={20} /></div>
              <h3 className="text-stone-500 font-medium text-sm">{t('profile.issues')}</h3>
            </div>
            <p className="text-3xl font-bold text-stone-900">{detectedIssues}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Sprout size={20} /></div>
              <h3 className="text-stone-500 font-medium text-sm">{t('profile.healthy')}</h3>
            </div>
            <p className="text-3xl font-bold text-stone-900">{healthyCrops}</p>
          </div>
        </div>

        {/* History Section */}
        <div>
          <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
            <History className="text-emerald-600" />
            {t('profile.history')}
          </h2>

          {user.history.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-stone-200 border-dashed">
              <Sprout className="mx-auto text-stone-300 w-16 h-16 mb-4" />
              <h3 className="text-lg font-medium text-stone-900">{t('profile.no_history')}</h3>
              <p className="text-stone-500 mb-6">Your pest and disease analysis results will appear here.</p>
              <button 
                onClick={() => onNavigate('detect')}
                className="px-6 py-2 bg-emerald-600 text-white rounded-full font-medium hover:bg-emerald-500 transition-colors"
              >
                {t('profile.start')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.history.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => item.fullAnalysis ? setSelectedReport(item.fullAnalysis) : alert("Detailed report not available for this older item.")}
                  className="bg-white rounded-xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1"
                >
                  <div className="h-48 overflow-hidden relative bg-gray-100">
                    {item.imagePreview ? (
                      <img src={item.imagePreview} alt={item.crop} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                         <Sprout size={40} />
                         <span className="ml-2 text-sm">No Image</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
                      {formatDate(item.date)}
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                       <span className="bg-white/90 text-stone-800 px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                          <FileSearch size={14} /> {t('profile.view')}
                       </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-stone-900 text-lg group-hover:text-emerald-600 transition-colors">{item.pest}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                        ${item.severity === 'high' ? 'bg-red-100 text-red-700' : 
                          item.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 
                          'bg-green-100 text-green-700'}`
                      }>
                        {item.severity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-stone-500 mt-4">
                      <span className="flex items-center gap-1"><Sprout size={14} /> {item.crop}</span>
                      <span>{(item.confidence * 100).toFixed(0)}% Match</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report Modal */}
        {selectedReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedReport(null)}>
                <div 
                    className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-stone-50 rounded-2xl shadow-2xl animate-fade-in-up custom-scrollbar" 
                    onClick={e => e.stopPropagation()}
                >
                    <div className="sticky top-0 right-0 z-20 flex justify-end p-4 bg-gradient-to-b from-black/20 to-transparent pointer-events-none">
                        <button 
                            onClick={() => setSelectedReport(null)} 
                            className="pointer-events-auto p-2 bg-white text-stone-800 rounded-full shadow-lg hover:bg-stone-100 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <div className="-mt-20">
                        <ResultCard data={selectedReport} />
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default Profile;
