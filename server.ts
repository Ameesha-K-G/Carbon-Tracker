import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API Routes
app.post("/api/insights", async (req: express.Request, res: express.Response) => {
  try {
    const { logs, activeCategoryValues, xpLevel } = req.body;
    
    let client;
    try {
      client = getAiClient();
    } catch (err: any) {
      return res.status(500).json({ 
        error: "Gemini API key is not configured.", 
        message: err.message || "GEMINI_API_KEY secret is required. Please check Settings > Secrets." 
      });
    }

    const prompt = `
      Analyze the user's carbon footprint profile and generate highly personalized eco-insights.
      
      User Metrics Profile:
      - Active category weekly values (kg CO2e):
        * Transportation: ${activeCategoryValues?.transportation ?? 0} kg
        * Energy: ${activeCategoryValues?.energy ?? 0} kg
        * Diet: ${activeCategoryValues?.diet ?? 0} kg
        * Waste: ${activeCategoryValues?.waste ?? 0} kg
      - XP Level: ${xpLevel ?? 1}
      - Recent Activity Logs (up to 5): ${JSON.stringify(logs?.slice(-5) ?? [])}

      Provide realistic, actionable recommendations to reduce emissions in their high-emission category, state a projected yearly saving, and provide an encouraging, non-judgmental eco-tip.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional carbon footprint analyst and environmental wellness coach. Be inspiring, direct, positive, and realistic. Keep the summary paragraph under 120 words.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { 
              type: Type.STRING, 
              description: "A summary assessing their current carbon footprint and category distribution, celebrating efforts and highlighting main areas of improvement." 
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  action: { type: Type.STRING, description: "Highly specific, immediate actionable advice (e.g. 'Wash laundry with cold water', 'Try Meatless Mondays')." },
                  impact: { type: Type.STRING, description: "Estimated carbon-saving explanation (e.g. 'Saves ~10kg CO2 per month')." },
                  category: { type: Type.STRING, description: "One of: transportation, energy, diet, waste." }
                },
                required: ["action", "impact", "category"]
              },
              description: "3 highly description-tailored recommendations to reduce carbon footprint."
            },
            projectedSavingsKg: { 
              type: Type.NUMBER, 
              description: "An inspiring estimate of total kg of CO2 the user can save in a year by adopting these 3 recommendations." 
            },
            encouragement: { 
              type: Type.STRING, 
              description: "A friendly, warm encouragement or quote about micro-actions bringing macro-change." 
            }
          },
          required: ["summary", "recommendations", "projectedSavingsKg", "encouragement"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    res.json(JSON.parse(text.trim()));
  } catch (error: any) {
    console.error("Error generating insights:", error);
    res.status(500).json({ 
      error: "Failed to generate tailored insights", 
      message: error.message || "Unknown error" 
    });
  }
});

// Serve static assets & HMR setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
