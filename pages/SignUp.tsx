
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sprout, Loader2, MapPin, Ruler, Wheat, User, Mail, Lock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SignUpProps {
  onNavigate: (page: any) => void;
}

const SignUp: React.FC<SignUpProps> = ({ onNavigate }) => {
  const { signup } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    farmLocation: '',
    farmSize: '',
    primaryCrops: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signup(formData);
      onNavigate('profile');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center py-24 px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-100">
        
        <div className="bg-emerald-600 px-8 py-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
             <Sprout size={200} />
          </div>
          <h2 className="text-3xl font-bold text-white relative z-10">{t('auth.join')}</h2>
          <p className="text-emerald-100 mt-2 relative z-10">{t('auth.join.subtitle')}</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 mt-0.5 w-5 h-5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider border-b border-stone-100 pb-2 mb-4">Account Details</h3>
              
              <div className="relative">
                <User className="absolute left-3 top-3 text-stone-400 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder={t('auth.name')}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-3 text-stone-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder={t('auth.email')}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 text-stone-400 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder={t('auth.pass')}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-wider border-b border-stone-100 pb-2 mb-4">Farm Profile</h3>
              
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-stone-400 w-5 h-5" />
                <input
                  type="text"
                  name="farmLocation"
                  required
                  placeholder={t('auth.loc')}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Ruler className="absolute left-3 top-3 text-stone-400 w-5 h-5" />
                  <input
                    type="text"
                    name="farmSize"
                    placeholder={t('auth.size')}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    onChange={handleChange}
                  />
                </div>
                <div className="relative">
                  <Wheat className="absolute left-3 top-3 text-stone-400 w-5 h-5" />
                  <input
                    type="text"
                    name="primaryCrops"
                    placeholder={t('auth.crops')}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-wait mt-4 flex justify-center items-center"
            >
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : t('auth.btn.signup')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-stone-500">
              {t('auth.have_acct')}{' '}
              <button onClick={() => onNavigate('login')} className="text-emerald-600 font-semibold hover:underline">
                {t('auth.link.login')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
