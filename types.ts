
export enum IdentificationStatus {
  IDLE = 'IDLE',
  ANALYZING_IMAGE = 'ANALYZING_IMAGE',
  GENERATING_PLAN = 'GENERATING_PLAN',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface WeatherData {
  temperature: number;
  condition: string;
  isRainy: boolean;
  locationName?: string;
  latitude?: number;
  longitude?: number;
}

export interface PestIdentificationResult {
  crop: string;
  pest_label: string;
  confidence: number;
  notes: string;
}

export interface ChemicalRemedy {
  name: string; // Chemical name
  product_brands: string[]; // e.g. "Bayer Confidor", "Tata Mida"
  dosage_ml_per_litre: string;
  frequency_days: string;
  estimated_cost_inr: string; // e.g. "₹250 - ₹400 per acre"
}

export interface TreatmentPlan {
  pest_name: string;
  pest_name_local?: string; // Local language name
  severity: 'low' | 'medium' | 'high';
  organic_remedy: string; // "Gharelu Upay"
  chemical_remedy: ChemicalRemedy;
  safety: string;
  tts_short: string; // Text to speech content in local language
  notes: string;
  weather_risk_label?: 'low' | 'medium' | 'high';
  weather_advice?: string;
  local_language_explanation: string; // Full explanation in Hindi/Regional
}

export interface AnalysisResult {
  identification: PestIdentificationResult;
  treatment: TreatmentPlan;
  weather?: WeatherData;
}

export interface AnalysisHistoryItem {
  id: string;
  date: string;
  imagePreview: string; // Base64 thumbnail
  crop: string;
  pest: string;
  severity: string;
  confidence: number;
  fullAnalysis?: AnalysisResult; // Store complete data for re-rendering reports
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // In a real app, never store plain text! We simulate it here.
  avatar?: string;
  farmLocation: string;
  farmSize: string;
  primaryCrops: string;
  joinedDate: string;
  history: AnalysisHistoryItem[];
}
