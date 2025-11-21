
import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2, AlertCircle, Languages, Camera, X, UploadCloud, ScanLine } from 'lucide-react';
import { identifyPestFromImage, generateTreatmentPlan } from '../services/geminiService';
import { getLocalWeather } from '../services/weatherService';
import { IdentificationStatus, AnalysisResult } from '../types';
import ResultCard from '../components/ResultCard';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const DEMO_IMAGES = [
  { label: 'Select a demo image...', value: '' },
  { label: 'Potato Early Blight', value: 'https://cdn.mos.cms.futurecdn.net/aTdWJvnG8t43BaAJkFizKY-1280-80.jpg.webp' },
  { label: 'Tomato Hornworm', value: 'https://grangettos.com/cdn/shop/articles/shutterstock_1699161862_1200x.jpg?v=1627418836' },
  { label: 'Corn Rust', value: 'https://lgpress.clemson.edu/wp-content/uploads/sites/3/2022/06/corn-leaf-with-southern-rust-pustules-.jpeg' }
];

const Detect: React.FC = () => {
  const { isAuthenticated, addToHistory } = useAuth();
  const { language, t } = useLanguage();
  
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<IdentificationStatus>(IdentificationStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
        setError(t('detect.error.img'));
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      resetState();
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
        processFile(file);
    }
  };

  const handleDemoSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const url = e.target.value;
    if (!url) return;
    
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result as string);
            resetState();
        };
        reader.readAsDataURL(blob);
    } catch (err) {
        console.error("Failed to load demo image", err);
    }
  };

  const resetState = () => {
    setStatus(IdentificationStatus.IDLE);
    setResult(null);
    setError(null);
  };

  // Helper to map code to full name for Gemini
  const getFullLanguageName = (code: string) => {
    if (code === 'hi') return 'Hindi';
    if (code === 'bn') return 'Bengali';
    return 'English';
  };

  const analyzeImage = async () => {
    if (!image) return;

    try {
      setStatus(IdentificationStatus.ANALYZING_IMAGE);
      setError(null);

      const weatherPromise = getLocalWeather();

      const identification = await identifyPestFromImage(image);
      
      if (identification.pest_label.toLowerCase() === 'unknown' || identification.confidence < 0.4) {
         setError(t('detect.error.id'));
         setStatus(IdentificationStatus.ERROR);
         return;
      }

      setStatus(IdentificationStatus.GENERATING_PLAN);

      const weatherData = await weatherPromise;
      
      // Use the global language from context
      const treatment = await generateTreatmentPlan(
          identification, 
          weatherData, 
          getFullLanguageName(language)
      );

      const analysisResult = {
        identification,
        treatment,
        weather: weatherData
      };

      setResult(analysisResult);
      setStatus(IdentificationStatus.SUCCESS);

      if (isAuthenticated) {
        addToHistory({
          crop: identification.crop,
          pest: identification.pest_label,
          confidence: identification.confidence,
          severity: treatment.severity,
          imagePreview: image,
          fullAnalysis: analysisResult
        });
      }

    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please check internet connection.");
      setStatus(IdentificationStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 relative overflow-hidden">
      
      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none"></div>
      <div className="absolute top-20 right-0 w-96 h-96 bg-emerald-100/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-stone-200/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 pt-28 relative z-10">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-3 tracking-tight">{t('detect.title')}</h1>
          <p className="text-stone-600 max-w-lg mx-auto leading-relaxed">{t('detect.subtitle')}</p>
        </div>

        <div className="grid gap-8">
          
          {/* Upload Area */}
          <div className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-xl border border-white/50 ring-1 ring-stone-100/50">
            
            {!image ? (
              <div 
                className={`
                    relative border-2 border-dashed rounded-2xl h-80 flex flex-col items-center justify-center transition-all duration-300 overflow-hidden group
                    ${isDragging 
                        ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]' 
                        : 'border-stone-300 bg-stone-50/50 hover:border-emerald-400 hover:bg-stone-50'
                    }
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {/* Background Decoration */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                    <div className="absolute top-10 left-10 transform -rotate-12"><ScanLine size={120} /></div>
                    <div className="absolute bottom-10 right-10 transform rotate-12"><UploadCloud size={120} /></div>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-6 p-4 w-full max-w-md">
                    
                    <div className={`p-5 rounded-full shadow-sm transition-all duration-500 ${isDragging ? 'bg-emerald-100 text-emerald-700 scale-110' : 'bg-white text-emerald-500 group-hover:scale-110 group-hover:text-emerald-600 group-hover:shadow-md'}`}>
                        <UploadCloud className="w-10 h-10" />
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-stone-800">
                            {isDragging ? t('detect.drop') : t('detect.upload')}
                        </h3>
                        <p className="text-stone-500 mt-2 text-sm">
                            {t('detect.drag')}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 py-3 px-4 bg-white border border-stone-200 text-stone-700 rounded-xl font-semibold shadow-sm hover:bg-stone-50 hover:border-emerald-300 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <ImageIcon size={18} className="text-emerald-600" />
                            {t('detect.btn.file')}
                        </button>

                        <button 
                            onClick={() => cameraInputRef.current?.click()}
                            className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-xl font-semibold shadow-md shadow-emerald-200 hover:bg-emerald-500 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Camera size={20} />
                            {t('detect.btn.camera')}
                        </button>
                    </div>
                </div>

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                />
                <input 
                    type="file" 
                    ref={cameraInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    capture="environment"
                    className="hidden" 
                />
              </div>
            ) : (
              <div className="relative h-80 rounded-2xl overflow-hidden bg-stone-900/5 flex items-center justify-center group border border-stone-200">
                <img src={image} alt="Preview" className="h-full w-full object-contain" />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <button 
                        onClick={() => { setImage(null); resetState(); }}
                        className="bg-white text-red-500 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-red-50 transition-transform transform hover:scale-105 flex items-center gap-2"
                    >
                        <X size={18} /> {t('detect.btn.remove')}
                    </button>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="mt-8 flex flex-col gap-5">
              
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-stone-100 pt-6">
                <select 
                  onChange={handleDemoSelect}
                  className="block w-full sm:w-auto pl-3 pr-10 py-2.5 text-sm border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 rounded-lg bg-stone-50 text-stone-600 font-medium transition-shadow"
                >
                  {DEMO_IMAGES.map((opt, i) => (
                    <option key={i} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                <button 
                  onClick={analyzeImage}
                  disabled={!image || status === IdentificationStatus.ANALYZING_IMAGE || status === IdentificationStatus.GENERATING_PLAN}
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 shadow-lg transform
                    ${!image 
                        ? 'bg-stone-300 cursor-not-allowed shadow-none' 
                        : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:scale-95'
                    }
                    ${(status === IdentificationStatus.ANALYZING_IMAGE || status === IdentificationStatus.GENERATING_PLAN) ? 'cursor-wait opacity-90' : ''}
                  `}
                >
                  {status === IdentificationStatus.IDLE && <><ScanLine size={20} /> {t('detect.btn.analyze')}</>}
                  {status === IdentificationStatus.ANALYZING_IMAGE && <><Loader2 className="animate-spin w-5 h-5" /> {t('detect.btn.analyzing')}</>}
                  {status === IdentificationStatus.GENERATING_PLAN && <><Loader2 className="animate-spin w-5 h-5" /> {t('detect.btn.consulting')}</>}
                  {status === IdentificationStatus.SUCCESS && <><ScanLine size={20} /> {t('detect.btn.again')}</>}
                  {status === IdentificationStatus.ERROR && "Try Again"}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3 animate-fade-in shadow-sm">
              <AlertCircle className="text-red-500 mt-0.5" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Results */}
          {status === IdentificationStatus.SUCCESS && result && (
            <div className="animate-fade-in-up pb-12">
              {!isAuthenticated && (
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-4 shadow-sm">
                   <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600 hidden sm:block">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <span className="font-bold text-blue-900 block text-lg">{t('detect.promo.save')}</span>
                            <p className="text-blue-700 text-sm">{t('detect.promo.desc')}</p>
                        </div>
                   </div>
                   <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-500 transition-all shadow-md shadow-blue-500/20 active:scale-95" onClick={() => (window as any).location.reload()}>
                        {t('detect.promo.btn')}
                   </button>
                </div>
              )}
              <ResultCard data={result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Detect;
