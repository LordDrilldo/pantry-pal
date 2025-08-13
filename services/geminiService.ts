
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { Recipe } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recipeSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      recipeName: {
        type: Type.STRING,
        description: 'The name of the recipe.',
      },
      description: {
        type: Type.STRING,
        description: 'A brief, enticing description of the dish.'
      },
      ingredients: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: 'The ingredients required for the recipe, taken from the provided list.',
      },
      instructions: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: 'The step-by-step instructions for preparing the recipe.'
      }
    },
    required: ["recipeName", "description", "ingredients", "instructions"],
  },
};

export const generateRecipes = async (ingredients: string[]): Promise<Recipe[]> => {
  if (ingredients.length === 0) {
    return [];
  }

  const prompt = `Based on the following ingredients, suggest a few creative and practical recipes.
  
  Available Ingredients: ${ingredients.join(', ')}
  
  Please provide recipes that primarily use these ingredients. You can assume common pantry staples like salt, pepper, and water are available.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      },
    });

    const jsonText = response.text.trim();
    const recipes: Recipe[] = JSON.parse(jsonText);
    return recipes;

  } catch (error) {
    console.error("Error generating recipes:", error);
    throw new Error("Failed to generate recipes. The AI might be busy, please try again later.");
  }
};
