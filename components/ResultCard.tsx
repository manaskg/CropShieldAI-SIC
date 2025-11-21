
import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult } from '../types';
import { AlertTriangle, ThermometerSun, Volume2, Droplet, Sprout, Shield, ShoppingBag, IndianRupee, Pause, ChevronDown, ChevronUp, Play, Loader2, Mic, MessageCircle, Send, Search, MapPin, ExternalLink, CloudRain, CloudSun, User, Sparkles, VolumeX } from 'lucide-react';
import { generatePestAudioExplanation, askFollowUpQuestion, findNearbyShops } from '../services/geminiService';
import { useLanguage } from '../context/LanguageContext';

interface ResultCardProps {
  data: AnalysisResult;
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    sources?: string[];
}

interface ShopResult {
    title: string;
    uri: string;
}

// Helper to decode base64 string to byte array
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to write string to DataView for WAV header
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Helper to convert raw PCM data to WAV Blob for native playback support
function pcmToWav(pcmData: Uint8Array, sampleRate: number = 24000, numChannels: number = 1): Blob {
  const buffer = new ArrayBuffer(44 + pcmData.length);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length
  view.setUint32(4, 36 + pcmData.length, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sampleRate * blockAlign)
  view.setUint32(28, sampleRate * numChannels * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, numChannels * 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, pcmData.length, true);

  // Write PCM data
  const pcmBytes = new Uint8Array(buffer, 44);
  pcmBytes.set(pcmData);

  return new Blob([buffer], { type: 'audio/wav' });
}

const ResultCard: React.FC<ResultCardProps> = ({ data }) => {
  const { identification, treatment, weather } = data;
  const { t, language } = useLanguage();
  // Collapsed by default
  const [isAdviceOpen, setIsAdviceOpen] = useState(false);
  
  // Audio State
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Chat State
  const [chatQuery, setChatQuery] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Shops State
  const [shops, setShops] = useState<ShopResult[]>([]);
  const [isLoadingShops, setIsLoadingShops] = useState(false);
  const [shopError, setShopError] = useState<string | null>(null);
  const [shopsVisible, setShopsVisible] = useState(false);

  // Initial Chat Greeting based on language
  useEffect(() => {
      const getGreeting = () => {
          if(language === 'hi') return `नमस्ते! मैं किसान सहायक हूँ। मैं आपकी ${treatment.pest_name} समस्या के बारे में जानता हूँ। मुझसे कुछ भी पूछें!`;
          if(language === 'bn') return `নমস্কার! আমি কৃষক সহায়ক। আমি আপনার ${treatment.pest_name} সমস্যা সম্পর্কে জানি। আমাকে কিছু জিজ্ঞাসা করুন!`;
          return `Namaste! I am Kisan Sahayak. I know about the ${treatment.pest_name} on your crop. Ask me anything!`;
      };
      
      setMessages([{ id: '1', sender: 'ai', text: getGreeting() }]);
  }, [treatment.pest_name, language]);

  // Scroll to bottom when messages change or when loading starts
  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatLoading]);

  const getFullLanguageName = () => {
    if (language === 'hi') return 'Hindi';
    if (language === 'bn') return 'Bengali';
    return 'English';
  };

  const handleGenerateAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
        setIsGeneratingAudio(true);
        const base64 = await generatePestAudioExplanation(identification, treatment, weather, getFullLanguageName());
        
        // Convert PCM to WAV for robust playback
        const pcmData = decodeBase64(base64);
        const wavBlob = pcmToWav(pcmData);
        const url = URL.createObjectURL(wavBlob);
        
        setAudioUrl(url);
        setIsGeneratingAudio(false);
        
        // Attempt autoplay
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.play().catch(e => console.warn("Autoplay prevented", e));
            }
        }, 100);
    } catch (error) {
        console.error("Failed to generate audio", error);
        alert("Could not generate audio. Please try again.");
        setIsGeneratingAudio(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    }
  };

  const onTimeUpdate = () => {
      if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
      }
  };

  const onLoadedMetadata = () => {
      if (audioRef.current) {
          setDuration(audioRef.current.duration);
      }
  };
  
  const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = parseFloat(e.target.value);
      if (audioRef.current) {
          audioRef.current.currentTime = time;
          setCurrentTime(time);
      }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const vol = parseFloat(e.target.value);
      setVolume(vol);
      if (audioRef.current) {
          audioRef.current.volume = vol;
          setIsMuted(vol === 0);
      }
  };

  const toggleMute = () => {
      if (audioRef.current) {
          const newMute = !isMuted;
          setIsMuted(newMute);
          audioRef.current.muted = newMute;
          if (!newMute && volume === 0) {
              setVolume(0.5);
              audioRef.current.volume = 0.5;
          }
      }
  };

  const formatTime = (time: number) => {
      if (isNaN(time)) return "0:00";
      const min = Math.floor(time / 60);
      const sec = Math.floor(time % 60);
      return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: chatQuery };
    setMessages(prev => [...prev, userMsg]);
    setChatQuery('');
    setIsChatLoading(true);

    try {
        const response = await askFollowUpQuestion(
            userMsg.text,
            {
                crop: identification.crop,
                pest: treatment.pest_name,
                remedy: treatment.organic_remedy,
                chemical: treatment.chemical_remedy.name
            },
            getFullLanguageName()
        );

        const aiMsg: ChatMessage = { 
            id: (Date.now() + 1).toString(), 
            sender: 'ai', 
            text: response.text,
            sources: response.sourceUrls 
        };
        setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: "Sorry, I'm having trouble connecting to the internet right now." }]);
    } finally {
        setIsChatLoading(false);
    }
  };

  const handleFindShops = async () => {
    if (isLoadingShops) return;
    if (shops.length > 0) {
        setShopsVisible(!shopsVisible);
        return;
    }

    const executeShopSearch = async (lat: number, lng: number) => {
        setIsLoadingShops(true);
        setShopError(null);
        try {
            const result = await findNearbyShops(lat, lng, treatment.chemical_remedy.name);
            if (result.shops && result.shops.length > 0) {
                setShops(result.shops);
                setShopsVisible(true);
            } else {
                setShopError("No specific shops found nearby. Try checking the market.");
            }
        } catch (err) {
            console.error("Shop search failed", err);
            setShopError("Could not find shops at this moment.");
        } finally {
            setIsLoadingShops(false);
        }
    };

    if (weather?.latitude && weather?.longitude) {
        await executeShopSearch(weather.latitude, weather.longitude);
        return;
    }

    if (navigator.geolocation) {
        setIsLoadingShops(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                executeShopSearch(position.coords.latitude, position.coords.longitude);
            },
            (err) => {
                console.error("Geolocation denied", err);
                setShopError("Please enable location access to find nearby shops.");
                setIsLoadingShops(false);
            }
        );
    } else {
        setShopError("Geolocation is not supported by your browser.");
    }
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    
    return (
      <div className="space-y-3">
        {lines.map((line, index) => {
          let trimmed = line.trim();
          const isListItem = /^[•*-]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed);
          if (isListItem) trimmed = trimmed.replace(/^[•*-]\s?/, '').replace(/^\d+\.\s?/, '');
          const parts = trimmed.split(/(\*\*.*?\*\*)/g);
          const content = parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-bold text-stone-900 bg-yellow-50/50 px-1 rounded">{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
          });

          if (isListItem) {
            return (
              <div key={index} className="flex items-start gap-3">
                 <div className="mt-2 min-w-[6px] h-[6px] rounded-full bg-emerald-500 shrink-0 shadow-sm" />
                 <div className="text-stone-700 leading-relaxed">{content}</div>
              </div>
            );
          }
          return (
            <div key={index} className="text-stone-700 leading-relaxed">
              {content}
            </div>
          );
        })}
      </div>
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-stone-200 animate-fade-in font-sans">
        
        {/* Header Section */}
        <div className="bg-emerald-700 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 -mr-8 -mt-8">
            <Sprout size={150} />
            </div>
            <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
                <span className="bg-emerald-900/50 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-emerald-500/30">
                {t('result.conf')}: {(identification.confidence * 100).toFixed(0)}%
                </span>
                <span className="flex items-center gap-1 text-emerald-100 text-sm font-medium">
                <Sprout size={16} /> {identification.crop}
                </span>
            </div>
            
            <div className="flex flex-col">
                <h2 className="text-2xl font-bold capitalize">
                {treatment.pest_name_local || identification.pest_label}
                </h2>
                <span className="text-emerald-200 text-sm font-medium">({identification.pest_label})</span>
            </div>
            </div>
        </div>

        <div className="p-6 space-y-6">

            {/* Weather Context Card - Prominent Position */}
            {weather && (
                <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 border border-sky-100 flex items-center gap-4 shadow-sm animate-fade-in">
                    <div className="bg-white p-3 rounded-full shadow-sm text-sky-600">
                        {weather.isRainy ? <CloudRain size={24} /> : <CloudSun size={24} />}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wide">Current Weather</h4>
                            {weather.locationName && (
                                <span className="text-[10px] bg-white/60 px-2 py-0.5 rounded-full text-sky-700 flex items-center gap-1">
                                    <MapPin size={10}/> {weather.locationName}
                                </span>
                            )}
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-bold text-stone-800">{weather.temperature}°C</span>
                            <span className="text-stone-600 font-medium capitalize">{weather.condition}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Badges - Below Weather for context */}
            <div className="flex flex-wrap gap-3">
                <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 font-medium capitalize ${getSeverityColor(treatment.severity)}`}>
                    <AlertTriangle size={18} />
                    {t('result.sev')}: {treatment.severity}
                </div>
                {weather && (
                    <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 font-medium ${getSeverityColor(treatment.weather_risk_label || 'low')}`}>
                        <ThermometerSun size={18} />
                        {t('result.risk')}: {treatment.weather_risk_label}
                    </div>
                )}
            </div>
            
            {/* Diagnosis & Audio - Collapsed by default */}
            <div className="border border-emerald-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300">
                <button 
                    onClick={() => setIsAdviceOpen(!isAdviceOpen)}
                    className="w-full flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100/50 transition-colors text-left"
                >
                    <h3 className="text-stone-900 font-bold flex items-center gap-2 font-sans text-lg">
                        <Shield className="text-emerald-600" size={20} />
                        {t('result.diag')}
                    </h3>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-emerald-600 font-medium hidden sm:block">
                            {isAdviceOpen ? '' : 'Tap to view details & audio'}
                        </span>
                        {isAdviceOpen ? <ChevronUp className="text-emerald-600" /> : <ChevronDown className="text-emerald-600" />}
                    </div>
                </button>

                {isAdviceOpen && (
                    <div className="p-5 border-t border-emerald-100 bg-white animate-fade-in-up">
                        
                        {/* Improved Audio Player Section */}
                        <div className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100 shadow-sm">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-full shadow-sm text-emerald-600">
                                            <Mic size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-emerald-900">{getFullLanguageName()} Audio Guide</h4>
                                            <p className="text-xs text-emerald-600 font-medium">Listen to expert advice</p>
                                        </div>
                                    </div>
                                    
                                    {!audioUrl && (
                                         <button 
                                            onClick={handleGenerateAudio}
                                            disabled={isGeneratingAudio}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center gap-2 disabled:opacity-70"
                                        >
                                            {isGeneratingAudio ? <Loader2 className="animate-spin w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                            {isGeneratingAudio ? 'Generating...' : 'Generate Audio'}
                                        </button>
                                    )}
                                </div>

                                {audioUrl && (
                                    <div className="bg-white/60 rounded-lg p-3 border border-emerald-100/50 animate-fade-in">
                                        <audio 
                                            ref={audioRef} 
                                            src={audioUrl} 
                                            onTimeUpdate={onTimeUpdate}
                                            onLoadedMetadata={onLoadedMetadata}
                                            onEnded={onEnded}
                                            onPlay={() => setIsPlaying(true)}
                                            onPause={() => setIsPlaying(false)}
                                            className="hidden"
                                        />
                                        
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={togglePlay}
                                                className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-600 text-white shadow-md hover:bg-emerald-500 transition-all shrink-0"
                                            >
                                                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                                            </button>
                                            
                                            <div className="flex-1 flex flex-col gap-1">
                                                <input 
                                                    type="range" 
                                                    min="0" 
                                                    max={duration || 100} 
                                                    value={currentTime} 
                                                    onChange={handleSeek}
                                                    className="w-full h-1.5 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                                />
                                                <div className="flex justify-between text-[10px] font-medium text-emerald-700">
                                                    <span>{formatTime(currentTime)}</span>
                                                    <span>{formatTime(duration)}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 group relative">
                                                <button onClick={toggleMute} className="text-emerald-600 hover:text-emerald-700 p-1">
                                                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                                </button>
                                                <input 
                                                    type="range" 
                                                    min="0" 
                                                    max="1" 
                                                    step="0.1"
                                                    value={isMuted ? 0 : volume} 
                                                    onChange={handleVolumeChange}
                                                    className="w-16 h-1.5 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 hidden sm:block"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-lg">
                            {renderFormattedText(treatment.local_language_explanation)}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Plan Grid */}
            <div className="grid md:grid-cols-2 gap-6">
            
            {/* Organic */}
            <div className="bg-green-50 p-5 rounded-xl border border-green-100 relative">
                <div className="absolute top-0 right-0 bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                    {t('result.organic.rec')}
                </div>
                <h3 className="text-lg font-bold text-green-800 flex items-center gap-2 mb-3">
                <Sprout className="text-green-600" /> {t('result.organic')}
                </h3>
                <div className="text-stone-700 leading-relaxed text-sm font-medium">
                    {renderFormattedText(treatment.organic_remedy)}
                </div>
                <div className="mt-3 text-xs text-green-700 flex items-center gap-1">
                    <IndianRupee size={12} /> {t('result.cost.low')}
                </div>
            </div>

            {/* Chemical */}
            <div className="bg-amber-50 p-5 rounded-xl border border-amber-100 flex flex-col">
                <h3 className="text-lg font-bold text-amber-800 flex items-center gap-2 mb-3">
                <Droplet className="text-amber-600" /> {t('result.chem')}
                </h3>
                
                <div className="space-y-3 text-sm flex-grow">
                    <div>
                        <span className="text-amber-900/60 text-xs uppercase tracking-wide font-bold block mb-1">{t('result.chem.name')}</span>
                        <span className="font-bold text-stone-800">{treatment.chemical_remedy.name}</span>
                    </div>

                    <div className="bg-white/50 p-3 rounded-lg border border-amber-100">
                        <span className="text-amber-900/60 text-xs uppercase tracking-wide font-bold block mb-1 flex items-center gap-1">
                            <ShoppingBag size={12} /> {t('result.chem.brand')}
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {treatment.chemical_remedy.product_brands && treatment.chemical_remedy.product_brands.length > 0 
                                ? treatment.chemical_remedy.product_brands.map((brand, i) => (
                                    <span key={i} className="bg-white text-amber-900 px-2 py-1 rounded shadow-sm border border-amber-100 font-medium text-xs">
                                        {brand}
                                    </span>
                                ))
                                : <span className="text-stone-500 italic">Ask local dealer</span>
                            }
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="text-amber-900/60 text-xs uppercase tracking-wide font-bold block">{t('result.chem.dosage')}</span>
                            <span className="font-medium text-stone-800">{treatment.chemical_remedy.dosage_ml_per_litre}</span>
                        </div>
                        <div>
                            <span className="text-amber-900/60 text-xs uppercase tracking-wide font-bold block">{t('result.chem.cost')}</span>
                            <span className="font-bold text-emerald-700">{treatment.chemical_remedy.estimated_cost_inr}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-amber-200/50">
                    <button 
                        onClick={handleFindShops}
                        className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all text-sm active:scale-95"
                        disabled={isLoadingShops}
                    >
                        {isLoadingShops ? <Loader2 className="animate-spin w-4 h-4" /> : <MapPin size={16} />}
                        {isLoadingShops ? t('result.shop.locating') : (shops.length > 0 ? (shopsVisible ? t('result.shop.hide') : t('result.shop.show')) : t('result.shop.find'))}
                    </button>
                    
                    {shopError && <p className="text-xs text-red-600 mt-2 text-center">{shopError}</p>}
                    
                    {shopsVisible && shops.length > 0 && (
                        <div className="mt-3 bg-white rounded-lg border border-amber-200 shadow-inner overflow-hidden animate-fade-in">
                             <div className="bg-amber-100/50 px-3 py-2 text-xs font-bold text-amber-800 border-b border-amber-200">
                                Nearby Stores for {treatment.chemical_remedy.name}
                             </div>
                             <div className="max-h-48 overflow-y-auto">
                                {shops.map((shop, idx) => (
                                    <a 
                                        key={idx} 
                                        href={shop.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="block px-3 py-2.5 border-b border-stone-100 last:border-none hover:bg-amber-50 transition-colors flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="bg-amber-100 p-1.5 rounded text-amber-700">
                                                <MapPin size={12} />
                                            </div>
                                            <span className="text-sm font-medium text-stone-800 line-clamp-1">{shop.title}</span>
                                        </div>
                                        <ExternalLink size={12} className="text-stone-400 group-hover:text-amber-600" />
                                    </a>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            </div>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
                <Shield className="text-orange-500 mt-1 flex-shrink-0" size={20} />
                <div>
                <h4 className="font-bold text-orange-900">{t('result.safe')}</h4>
                <p className="text-orange-800 mt-1 text-sm">{treatment.safety}</p>
                <p className="text-orange-800 mt-2 text-sm font-medium">
                    🌥 {treatment.weather_advice}
                </p>
                </div>
            </div>
            </div>
        </div>
        </div>

        {/* Kisan Sahayak Chat Interface */}
        <div className="bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden flex flex-col h-[600px] md:h-[550px]">
            
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white flex items-center justify-between shadow-md z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                        <Sparkles size={20} className="text-yellow-300" fill="currentColor" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            {t('result.chat.title')}
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        </h3>
                        <p className="text-emerald-100 text-xs opacity-90">{t('result.chat.subtitle')}</p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-xs bg-emerald-800/40 px-3 py-1 rounded-full border border-emerald-500/30">
                    <Search size={12} className="text-emerald-200" />
                    <span className="text-emerald-100 font-medium">{t('result.chat.connected')}</span>
                </div>
            </div>
            
            {/* Chat Body */}
            <div className="flex-1 bg-stone-50 overflow-y-auto p-4 space-y-6 custom-scrollbar scroll-smooth relative">
                <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/subtle-dots.png')] pointer-events-none"></div>
                
                {messages.map((msg) => {
                    const isUser = msg.sender === 'user';
                    return (
                        <div key={msg.id} className={`flex gap-3 relative z-10 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in-up`}>
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white ${isUser ? 'bg-stone-200 text-stone-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                {isUser ? <User size={16} /> : <Sprout size={16} />}
                            </div>
                            
                            {/* Bubble */}
                            <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                                <div 
                                    className={`
                                        px-4 py-3 text-sm shadow-sm relative leading-relaxed
                                        ${isUser 
                                            ? 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white rounded-2xl rounded-tr-none shadow-emerald-100' 
                                            : 'bg-white text-stone-800 border border-stone-100 rounded-2xl rounded-tl-none'
                                        }
                                    `}
                                >
                                    <p>{msg.text}</p>
                                </div>
                                
                                {/* Sources Chips */}
                                {msg.sources && msg.sources.length > 0 && (
                                    <div className={`flex flex-wrap gap-2 mt-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                                        {msg.sources.map((url, i) => (
                                            <a 
                                                key={i} 
                                                href={url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full hover:bg-emerald-100 transition-colors max-w-[150px]"
                                            >
                                                <ExternalLink size={10} />
                                                <span className="truncate">{new URL(url).hostname}</span>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                
                {isChatLoading && (
                    <div className="flex gap-3 animate-fade-in-up">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border border-white shadow-sm">
                            <Sprout size={16} />
                        </div>
                        <div className="bg-white px-4 py-4 rounded-2xl rounded-tl-none border border-stone-100 shadow-sm flex items-center gap-1.5 h-[54px]">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-stone-100 z-10 shrink-0">
                <form onSubmit={handleSendMessage} className="relative flex items-center">
                    <input 
                        type="text" 
                        value={chatQuery}
                        onChange={(e) => setChatQuery(e.target.value)}
                        placeholder={t('result.chat.placeholder')}
                        className="w-full pl-5 pr-14 py-3.5 bg-stone-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-full text-sm transition-all shadow-inner placeholder:text-stone-400"
                        disabled={isChatLoading}
                    />
                    <button 
                        type="submit"
                        disabled={!chatQuery.trim() || isChatLoading}
                        className="absolute right-2 p-2 bg-emerald-600 text-white rounded-full shadow-md hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                    >
                        <Send size={18} className={chatQuery.trim() ? 'ml-0.5' : ''} />
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
};

export default ResultCard;
