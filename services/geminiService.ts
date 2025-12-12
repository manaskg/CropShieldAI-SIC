
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PestIdentificationResult, TreatmentPlan, WeatherData } from "../types";

const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found in environment variables.");
    }
    return new GoogleGenAI({ apiKey });
};

/**
 * Step 1: Identify Crop and Pest
 */
export const identifyPestFromImage = async (base64Image: string): Promise<PestIdentificationResult> => {
    const ai = getAiClient();
    
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const prompt = `
    Act as an expert Plant Pathologist and Agronomist.
    Analyze the image provided.
    
    Task:
    1. Identify the CROP (e.g., Potato, Wheat, Tomato). If it's not a crop, mark pest_label as 'Unknown'.
    2. Identify the PEST, DISEASE, or DEFICIENCY. If the plant looks healthy, set pest_label to 'Healthy'.
    3. Provide a confidence score (0.0 to 1.0).
    4. In 'notes', provide a very brief, 1-sentence visual reason for your decision (e.g., "Yellowing spots with concentric rings indicate Early Blight.").

    Respond strictly in JSON format.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        crop: { type: Type.STRING },
                        pest_label: { type: Type.STRING },
                        confidence: { type: Type.NUMBER },
                        notes: { type: Type.STRING },
                    },
                    required: ["crop", "pest_label", "confidence", "notes"],
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as PestIdentificationResult;
        }
        throw new Error("Empty response from AI");
    } catch (error) {
        console.error("Identify Pest Error:", error);
        throw error;
    }
};

/**
 * Step 2: Generate Indian-Context Treatment Plan
 */
export const generateTreatmentPlan = async (
    identification: PestIdentificationResult, 
    weather?: WeatherData,
    language: string = 'Hindi' // Default to Hindi if not specified
): Promise<TreatmentPlan> => {
    const ai = getAiClient();

    let weatherContext = "No local weather data available.";
    if (weather) {
        weatherContext = `Local Weather: ${weather.condition}, ${weather.temperature}°C. Rain likely: ${weather.isRainy ? 'Yes' : 'No'}.`;
    }

    const prompt = `
    You are 'Kisan Mitra' (Farmer's Friend), a senior agricultural expert in India.
    The user is a smallholder farmer who may have limited literacy or budget.
    Target Language: ${language}.

    INPUT DATA:
    - Crop: ${identification.crop}
    - Diagnosis: ${identification.pest_label}
    - Weather Context: ${weatherContext}

    STRICT GUIDELINES:
    1. **Tone**: Empathetic, direct, and encouraging. Speak like a village elder or a helpful neighbor.
    2. **Simplicity**: NO scientific jargon. Use simple terms understood by rural farmers.
    3. **Formatting**: The 'local_language_explanation' must be beautifully formatted with Markdown (Bullet points, **Bold** keys).
    4. **Language Enforcement**:
       - If Target Language is 'English': Output text MUST be in simple English. Do NOT use Hindi words or script.
       - If Target Language is 'Hindi': Output text MUST be in Hindi (Devanagari script).
       - If Target Language is 'Bengali': Output text MUST be in Bengali script.

    TREATMENT STRATEGY:
    1. **Organic First (Desi Jugad)**: Suggest low-cost, home-made remedies accessible in an Indian village (e.g., Neem oil, Ash, Lassi, Cow urine) if effective.
    2. **Chemicals**: Suggest widely available Indian brands (Tata, Bayer, Dhanuka, Syngenta). 
       - COST is critical. Estimate costs in INR (₹).
    3. **Weather Logic**: If it is rainy, advise adding a 'Sticker' (Chipko) or waiting.

    OUTPUT REQUIREMENTS (JSON):
    - 'pest_name_local': The common name farmers use in ${language} (e.g., 'Early Blight' in English, 'Agaiti Jhulsa' in Hindi).
    - 'tts_short': A conversational, spoken summary script (2-3 sentences) strictly in ${language}.
    - 'local_language_explanation': A detailed guide in ${language}.
    
    Respond in JSON:
    { 
        pest_name:'Scientific Name', 
        pest_name_local: 'Local Name in ${language}',
        severity:'low|medium|high', 
        organic_remedy:'Detailed home remedy in ${language}', 
        chemical_remedy:{ 
            name:'Chemical Name', 
            product_brands: ['Brand A', 'Brand B'],
            dosage_ml_per_litre:'e.g. 2ml per litre', 
            frequency_days:'e.g. every 10 days',
            estimated_cost_inr: 'e.g. ₹300 per acre'
        }, 
        safety:'One crucial safety tip in ${language}', 
        tts_short:'Spoken script summary in ${language}', 
        notes:'Technical notes (can be English)',
        weather_risk_label: 'low|medium|high',
        weather_advice: 'Weather specific advice in ${language}',
        local_language_explanation: 'Full formatted guide in ${language}'
    }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        pest_name: { type: Type.STRING },
                        pest_name_local: { type: Type.STRING },
                        severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
                        organic_remedy: { type: Type.STRING },
                        chemical_remedy: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                product_brands: { type: Type.ARRAY, items: { type: Type.STRING } },
                                dosage_ml_per_litre: { type: Type.STRING },
                                frequency_days: { type: Type.STRING },
                                estimated_cost_inr: { type: Type.STRING }
                            },
                            required: ["name", "product_brands", "dosage_ml_per_litre", "frequency_days", "estimated_cost_inr"]
                        },
                        safety: { type: Type.STRING },
                        tts_short: { type: Type.STRING },
                        notes: { type: Type.STRING },
                        weather_risk_label: { type: Type.STRING, enum: ["low", "medium", "high"] },
                        weather_advice: { type: Type.STRING },
                        local_language_explanation: { type: Type.STRING }
                    },
                    required: ["pest_name", "severity", "organic_remedy", "chemical_remedy", "safety", "tts_short", "weather_risk_label", "weather_advice", "local_language_explanation"]
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as TreatmentPlan;
        }
        throw new Error("Empty treatment response from AI");
    } catch (error) {
        console.error("Treatment Plan Error:", error);
        throw error;
    }
};

/**
 * Step 3: Generate Audio Explanation (TTS)
 */
export const generatePestAudioExplanation = async (
    identification: PestIdentificationResult,
    treatment: TreatmentPlan,
    weather: WeatherData | undefined,
    language: string
): Promise<string> => {
    const ai = getAiClient();

    const weatherText = weather ? `Weather is ${weather.condition}, ${weather.temperature}°C. Rain likely: ${weather.isRainy ? 'Yes' : 'No'}.` : 'No weather data.';
    
    // Dynamic Greeting & Farewell
    let greeting = "Hello Farmer Friend.";
    let farewell = "Take care, friend. Happy farming.";
    
    if (language.toLowerCase().includes('hindi')) {
        greeting = "Ram Ram Kisan Bhai.";
        farewell = "Accha chalta hoon bhai, khet ka dhyaan rakhna. Ram Ram.";
    }
    else if (language.toLowerCase().includes('bengali')) {
        greeting = "Nomoshkar Krishak Bondhu.";
        farewell = "Ashi tobe, bhalo thakben. Phosoler jotno nin.";
    }

    const prompt = `
    ROLE: You are a wise, caring, and talkative village elder (Kisan Mitra) talking to a farmer on the phone.
    TARGET LANGUAGE: ${language}
    
    INPUT DATA:
    - Crop: ${identification.crop}
    - Disease/Pest: ${treatment.pest_name_local} (${treatment.pest_name})
    - Severity: ${treatment.severity}
    - Organic Remedy: ${treatment.organic_remedy}
    - Chemical Remedy: ${treatment.chemical_remedy.name} (Dosage: ${treatment.chemical_remedy.dosage_ml_per_litre})
    - Estimated Cost: ${treatment.chemical_remedy.estimated_cost_inr}
    - Safety: ${treatment.safety}
    - Weather Context: ${weatherText}

    CRITICAL RULES:
    1. **NO SELF-INTRODUCTION**: Do NOT say "I am AI" or "I am an expert". Start DIRECTLY with the greeting.
    2. **LANGUAGE STRICTNESS**: 
       - If the Target Language is **English**, speak in clear, simple English. Do NOT use Hindi words like "Bhai" or "Ram Ram" unless specifically in the greeting variables.
       - If the Target Language is **Hindi**, speak in pure Hindi.
       - If the Target Language is **Bengali**, speak in pure Bengali.
    3. **LENGTH**: 45-55 seconds.
    4. **TONE**: Warm, supportive, and practical.

    SCRIPT STRUCTURE:
    1. **Greeting**: Start with "${greeting}".
    2. **The Problem & Empathy**: "I see your ${identification.crop} has ${treatment.pest_name_local}. Don't worry, it happens. If we treat it now, the crop will be saved. If we delay, it might spread to the whole field and ruin the harvest."
    3. **Organic Method (The 'Desi' way)**: Explain *how* to use the organic remedy in detail (e.g., "Mix it well and spray").
    4. **Chemical Method (The strong way)**: "If you want a quick cure, buy ${treatment.chemical_remedy.name}. It will cost around ${treatment.chemical_remedy.estimated_cost_inr}. Mix ${treatment.chemical_remedy.dosage_ml_per_litre} in one liter of water."
    5. **Weather & Timing**: 
       - If raining: "It looks like rain. Don't spray now, the medicine will wash away! Wait for sun."
       - If sunny: "The weather is good. Spray it this evening when the sun is low."
    6. **Caution**: "Friend, one important thing. Please tie a cloth on your mouth while spraying. Your health is wealth."
    7. **Farewell**: End with "${farewell}".

    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{
                parts: [{ text: prompt }]
            }],
            config: {
                responseModalities: [Modality.AUDIO], 
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }
                    }
                }
            }
        });

        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    return part.inlineData.data;
                }
            }
        }

        const finishReason = response.candidates?.[0]?.finishReason;
        if (finishReason) {
             throw new Error(`Audio generation failed. Finish Reason: ${finishReason}`);
        }

        throw new Error("No audio content generated in response.");
    } catch (error) {
        console.error("Audio Generation Error:", error);
        throw error;
    }
};

/**
 * Step 4: Context-Aware Chat (Kisan Sahayak)
 */
export const askFollowUpQuestion = async (
    query: string,
    context: {
        crop: string;
        pest: string;
        remedy: string;
        chemical: string;
    },
    language: string
): Promise<{ text: string; sourceUrls: string[] }> => {
    const ai = getAiClient();

    const prompt = `
    You are "Kisan Sahayak", a friendly and practical Indian agricultural advisor.
    
    CONTEXT:
    User Language: ${language}
    Crop: ${context.crop}
    Current Issue: ${context.pest}
    Recommended Treatment: ${context.remedy} or ${context.chemical}
    
    USER QUESTION: "${query}"
    
    INSTRUCTIONS:
    1. Answer DIRECTLY in ${language}.
    2. **Language Rule**: If the User Language is English, reply in English. If Hindi, reply in Hindi. Do not mix languages.
    3. Keep it short (max 3-4 sentences). This is a chat.
    4. If asking for prices, use the Google Search tool to find *current* Indian market prices (in INR).
    5. If asking "Where to buy", suggest generic shop types (e.g., "IFFCO center", "Krishi Kendra") or major online retailers.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        const text = response.text || "I couldn't find an answer right now. Please ask a local shopkeeper.";

        const sourceUrls: string[] = [];
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
            chunks.forEach(chunk => {
                if (chunk.web?.uri) {
                    sourceUrls.push(chunk.web.uri);
                }
            });
        }

        return { text, sourceUrls };
    } catch (error) {
        console.error("Chat Error:", error);
        throw error;
    }
};

/**
 * Step 5: Find Nearby Agri Shops (Hyper-Local Market Linkage)
 */
export const findNearbyShops = async (
    lat: number,
    lng: number,
    productName: string
): Promise<{ text: string; shops: { title: string; uri: string }[] }> => {
    const ai = getAiClient();
    const prompt = `Find agricultural shops, fertilizer dealers, or Krishi Seva Kendras near me where I can buy "${productName}". List the best rated ones.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: lat,
                            longitude: lng
                        }
                    }
                }
            }
        });

        const text = response.text || "Here are some shops found near your location.";
        
        const shops: { title: string; uri: string }[] = [];
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        if (chunks) {
            chunks.forEach((chunk: any) => {
                if (chunk.web?.uri) {
                    shops.push({ title: chunk.web.title || "View Shop on Map", uri: chunk.web.uri });
                }
            });
        }

        return { text, shops };

    } catch (error) {
        console.error("Maps Tool Error:", error);
        throw error;
    }
};
