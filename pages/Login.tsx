
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sprout, Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LoginProps {
  onNavigate: (page: any) => void;
}

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      onNavigate('profile'); 
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center py-24 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-100">
        
        <div className="bg-emerald-600 px-8 py-8 text-center">
          <div className="inline-flex bg-white/20 p-4 rounded-full mb-4 backdrop-blur-sm">
             <Sprout size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">{t('auth.welcome')}</h2>
          <p className="text-emerald-100 mt-2">{t('auth.login.subtitle')}</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 mt-0.5 w-5 h-5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-wait flex justify-center items-center"
            >
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : t('auth.btn.login')}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-stone-100 pt-6">
            <p className="text-stone-500">
              {t('auth.no_acct')}{' '}
              <button onClick={() => onNavigate('signup')} className="text-emerald-600 font-semibold hover:underline">
                {t('auth.link.signup')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
