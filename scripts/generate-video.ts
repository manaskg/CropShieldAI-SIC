import { GoogleGenAI } from "@google/genai";

/**
 * SCRIPT: Generate Hero Video
 * 
 * This script demonstrates how to use the Gemini Veo model (veo-3.1-fast-generate-preview)
 * to generate a short, inspiring video for the landing page hero section.
 * 
 * Usage:
 * 1. Ensure process.env.API_KEY is set.
 * 2. Run this script (e.g., via ts-node).
 */

const generateHeroVideo = async () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("Error: API_KEY environment variable is missing.");
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  console.log("Initializing Video Generation...");

  try {
    // Using the fast generation model for quicker preview results
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: 'Cinematic drone shot of a farmer walking through a lush green wheat field at golden hour, touching the crops. High quality, 4k, warm earthy tones, inspiring, hopeful atmosphere.',
      config: {
        numberOfVideos: 1,
        resolution: '1080p', // High resolution for hero background
        aspectRatio: '16:9'  // Landscape for web
      }
    });

    console.log("Generation started. This may take a few minutes...");

    // Poll for completion
    while (!operation.done) {
      console.log("Thinking...");
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (videoUri) {
        console.log("Video Generation Complete!");
        console.log(`Download URL: ${videoUri}&key=${apiKey}`);
        console.log("Please download this video and place it in your public assets folder.");
    } else {
        console.error("Video generation failed or returned no URI.");
    }

  } catch (error) {
    console.error("An error occurred during video generation:", error);
  }
};

// Execute if run directly
// generateHeroVideo();
