
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

    const prompt = `Identify the crop and pest or insect in this image. Respond only in JSON with:
    { crop: '', pest_label: '', confidence: 0.0, notes: '' }.
    If unsure, return pest_label: 'unknown' and confidence: 0.0.`;

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
    You are an expert Indian Agronomist from a Krishi Vigyan Kendra. 
    Target Audience: A small-scale Indian farmer who speaks ${language}.
    
    Tone: Empathetic, simple, and encouraging.
    Language Level: Very simple, conversational. NO scientific jargon. Use words easily understood in villages.
    
    Structure:
    - Use Markdown formatting.
    - Use bullet points (•) for distinct steps.
    - Use **bold** text for important words, medicine names, or headings within the text.
    - Keep sentences short and direct.

    Context:
    Crop: ${identification.crop}
    Pest/Disease: ${identification.pest_label}
    ${weatherContext}

    Task:
    Provide a practical treatment plan. 
    1. Prioritize "Desi Jugad" (Home remedies) like Neem oil, lassi, ash, etc.
    2. For chemicals, suggest POPULAR INDIAN BRANDS (e.g., from Tata, Bayer, Syngenta, Dhanuka).
    3. Estimate costs in Indian Rupees (INR).
    4. Provide a translation of the advice in ${language}.
    
    IMPORTANT: If the language is Bengali, use simple Bengali (Bangla) words and the output MUST be in Bengali script.

    Respond in JSON:
    { 
        pest_name:'', 
        pest_name_local: 'Name in ${language}',
        severity:'low|medium|high', 
        organic_remedy:'Home remedy details', 
        chemical_remedy:{ 
            name:'Chemical name', 
            product_brands: ['Brand A', 'Brand B'],
            dosage_ml_per_litre:'', 
            frequency_days:'',
            estimated_cost_inr: 'e.g. ₹300 per acre'
        }, 
        safety:'Safety warning', 
        tts_short:'A short 2-sentence summary in ${language} for audio playback', 
        notes:'',
        weather_risk_label: 'low|medium|high',
        weather_advice: '',
        local_language_explanation: 'Full detailed explanation in ${language}. Use bullet points and bold text.'
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

    const weatherText = weather ? `Current weather is ${weather.condition}, ${weather.temperature} degrees celsius.` : '';
    
    // Simplified prompt to reduce complexity for the TTS model
    const prompt = `
    You are an agricultural expert. Speak to a farmer in ${language}.
    Explain the diagnosis: ${treatment.pest_name} on ${identification.crop}. severity is ${treatment.severity}.
    ${weatherText}
    Advise treatment: ${treatment.organic_remedy}. 
    Chemical option: ${treatment.chemical_remedy.name}.
    Safety: ${treatment.safety}.
    Keep it encouraging and under 45 seconds.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{
                parts: [{ text: prompt }]
            }],
            config: {
                // Use string literal "AUDIO" to ensure correct enum mapping in all environments
                responseModalities: ["AUDIO" as any], 
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }
                    }
                }
            }
        });

        // Iterate through parts to find the audio data
        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    return part.inlineData.data;
                }
            }
        }

        // Log specific reason if available
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
    You are "Kisan Sahayak", a friendly Indian agricultural expert.
    
    Context:
    The farmer has a ${context.crop} crop affected by ${context.pest}.
    We recommended: ${context.remedy} OR ${context.chemical}.
    
    Farmer's Question: "${query}"
    
    Task:
    Answer the farmer's question accurately in ${language}.
    - If asking about prices, use Google Search to find current prices in India.
    - If asking "where to buy", suggest generic shop types or use Search to find major retailers.
    - Keep the answer short (under 3 sentences) and very simple.
    - Do NOT use Markdown in the response, just plain text.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        // Extract text
        const text = response.text || "I couldn't find an answer right now. Please ask a local shopkeeper.";

        // Extract Grounding URLs if available
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
        
        // Extract Map Links from grounding chunks
        const shops: { title: string; uri: string }[] = [];
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        if (chunks) {
            chunks.forEach((chunk: any) => {
                // Google Maps tool returns data in 'web' (Search-like) or specific 'maps' structure
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
