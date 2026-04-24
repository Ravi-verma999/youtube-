import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getTrendingVideos() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `List 12 of the most popular, currently viral YouTube videos. 
      CRITICAL: You MUST provide EXACT, REAL, WORKING YouTube Video IDs (11 characters). Do not invent them.
      Examples of good IDs: 'hHrn076Kg28' (Interstellar), 'kJQP7kiw5Fk' (Despacito), '9bZkp7q19f0' (Gangnam Style).
      Return a JSON array: { id: string, title: string, channel: string, thumbnail: string, duration: string, views: string, time: string }.
      Thumbnail format: "https://i.ytimg.com/vi/[VIDEO_ID]/mqdefault.jpg".`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
}

export async function getRecommendations(videoId: string, title: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on the video "${title}" (ID: ${videoId}), suggest 6 highly relevant, real YouTube videos. 
      Return a JSON array: { id: string, title: string, channel: string, thumbnail: string, duration: string, views: string, time: string }.
      Ensure these are REAL trending videos from similar categories.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
}

export async function getCreatorSuggestions(topic: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The creator wants to upload a video about: "${topic}". 
      Provide: 
      1. Three viral, high-CTR titles.
      2. Five high-traffic hashtags.
      3. Ten optimized keywords.
      Return as a clean Markdown object.`,
    });
    return response.text;
  } catch (error) {
    return "Suggestions unavailable.";
  }
}

export async function aiSearchVideos(query: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search YouTube for: "${query}". Provide 12 accurate results.
      Return a JSON array: { id: string, title: string, channel: string, thumbnail: string, duration: string, views: string, time: string }.
      CRITICAL: Use ONLY real 11-char video IDs. Thumbnail as "https://i.ytimg.com/vi/[VIDEO_ID]/mqdefault.jpg".`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
}

export async function getAdvancedInsights(title: string, channel: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze: "${title}" by "${channel}". Give a 2-sentence summary and 3 key timestamps of what happens. Be brief. Markdown.`,
    });
    return response.text;
  } catch (error) {
    return "AI insight disabled.";
  }
}

export async function chatWithVideo(context: string, question: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Context: ${context}. Question: ${question}. Answer precisely.`,
    });
    return response.text;
  } catch (error) {
    return "AI error.";
  }
}
