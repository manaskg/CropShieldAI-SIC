import { GoogleGenAI } from "@google/genai";

/**
 * SCRIPT: Generate Hero Image / Character
 * 
 * This script demonstrates how to use the Imagen 3 model (imagen-4.0-generate-001)
 * to generate the specific hero assets for the CropShield landing page.
 */

const generateHeroImage = async () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("Error: API_KEY environment variable is missing.");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  console.log("Initializing Image Generation...");

  try {
    // PROMPT: Cute Ghibli-style Farmer Character
    const prompt = 'A cute farmer cartoon character holding corn plants, Studio Ghibli style, anime style, high quality, detailed, vibrant colors, soft lighting, transparent background if possible or simple nature background.';
    
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
        outputMimeType: 'image/png',
      },
    });

    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    
    if (base64ImageBytes) {
        console.log("Image Generation Complete!");
        console.log("Prompt used:", prompt);
        // In a real node environment, you would write this buffer to a file.
        // fs.writeFileSync('ghibli-farmer.png', Buffer.from(base64ImageBytes, 'base64'));
        console.log("Image data received (base64). Ready to save as 'ghibli-farmer.png' for use in Home.tsx");
    } else {
        console.error("Image generation failed or returned no data.");
    }

  } catch (error) {
    console.error("An error occurred during image generation:", error);
  }
};

// Execute if run directly
// generateHeroImage();