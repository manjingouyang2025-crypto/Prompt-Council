
import { GoogleGenAI, Type } from "@google/genai";
import { SimulationProfile, Draft, PromptUpgradeResult, TaskType, GroundingSource } from "../types";

const PRO_MODEL = 'gemini-3-pro-preview';
const FLASH_MODEL = 'gemini-3-flash-preview';

// Helper to clean JSON response from model if it wraps it in markdown blocks
const cleanJson = (text: string): string => {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```/, "").replace(/```$/, "");
  }
  return cleaned.trim();
};

const extractSourcesFromResponse = (response: any): GroundingSource[] => {
  const sources: GroundingSource[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title || "External Evidence",
          uri: chunk.web.uri
        });
      }
    });
  }
  return sources;
};

/**
 * Robust API calling with exponential backoff for 429s
 */
const callWithRetry = async (fn: () => Promise<any>, retries = 3, delay = 2000): Promise<any> => {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error.message || "";
    if (retries > 0 && (errorMsg.includes('429') || errorMsg.includes('quota'))) {
      console.warn(`Quota hit. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(res => setTimeout(res, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

/**
 * Extracts professional persona details from raw text to create a simulation profile.
 */
export const extractProfileFromText = async (text: string): Promise<Partial<SimulationProfile>> => {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: `Extract a professional persona from the following text. 
      Return a JSON object with: role, directive (core mission), heuristics (rules of thumb), vibe (personality), constraints (limitations).
      Text: ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            role: { type: Type.STRING },
            directive: { type: Type.STRING },
            heuristics: { type: Type.STRING },
            vibe: { type: Type.STRING },
            constraints: { type: Type.STRING },
          },
          required: ["role", "directive", "heuristics", "vibe", "constraints"],
        }
      }
    });
    return JSON.parse(cleanJson(response.text || "{}"));
  });
};

/**
 * Suggests council lenses and task type for a given goal.
 */
export const suggestCouncil = async (goal: string): Promise<{ profiles: SimulationProfile[], taskType: TaskType }> => {
  const data = await callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: `Analyze this strategic goal: "${goal}". 
      1. Determine if it's TaskType 'A' (Creative/Generative) or 'B' (Technical/Strategic/Analytical).
      2. Suggest 3 diverse expert personas (Council Lenses) to stress-test this goal.
      Return JSON with taskType ('A' or 'B') and profiles (array of objects with role, directive, heuristics, vibe, constraints, seed).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            taskType: { type: Type.STRING },
            profiles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  directive: { type: Type.STRING },
                  heuristics: { type: Type.STRING },
                  vibe: { type: Type.STRING },
                  constraints: { type: Type.STRING },
                  seed: { type: Type.STRING },
                },
                required: ["role", "directive", "heuristics", "vibe", "constraints", "seed"]
              }
            }
          },
          required: ["taskType", "profiles"]
        }
      }
    });
    return JSON.parse(cleanJson(response.text || "{}"));
  });
  
  const profiles = (data.profiles || []).map((p: any, i: number) => ({
    ...p,
    id: `suggested-${Date.now()}-${i}`,
    fidelityScore: 0.8,
    isHighFidelity: false
  }));

  return { 
    profiles, 
    taskType: data.taskType === 'A' ? 'A' : 'B' 
  };
};

/**
 * Simulates an expert perspective on the goal. Uses FLASH for higher quota tolerance.
 */
export const simulatePerspective = async (profile: SimulationProfile, goal: string, source: string, taskType: TaskType): Promise<Draft> => {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const config: any = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING },
          keyPoint: { type: Type.STRING },
          frictionPoint: { type: Type.STRING },
          whitePaper: { type: Type.STRING },
          brief: {
            type: Type.OBJECT,
            properties: {
              coreThesis: { type: Type.STRING },
              evidenceSnippets: { type: Type.ARRAY, items: { type: Type.STRING } },
              technicalConstraints: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["coreThesis", "evidenceSnippets", "technicalConstraints"]
          }
        },
        required: ["content", "keyPoint", "frictionPoint", "whitePaper", "brief"]
      }
    };

    if (taskType === 'B') {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: `You are simulating the following persona:
      Role: ${profile.role}
      Directive: ${profile.directive}
      Heuristics: ${profile.heuristics}
      Vibe: ${profile.vibe}
      Constraints: ${profile.constraints}
      
      Goal: ${goal}
      Context: ${source}
      
      Task: Write a detailed White Paper analyzing the goal from your perspective. 
      ${taskType === 'B' ? 'IMPORTANT: Search the web for real-world benchmarks, regulatory data, or technical case studies to ground your reasoning.' : ''}
      Identify one core Key Point and one major Friction Point.
      Return JSON.`,
      config: config
    });

    const data = JSON.parse(cleanJson(response.text || "{}"));
    const sources = extractSourcesFromResponse(response);

    return {
      perspectiveId: profile.id,
      perspectiveRole: profile.role,
      content: data.content,
      keyPoint: data.keyPoint,
      frictionPoint: data.frictionPoint,
      whitePaper: data.whitePaper,
      brief: data.brief,
      sources: sources.length > 0 ? sources : undefined
    };
  });
};

/**
 * Conducts adversarial debate between perspectives. Uses FLASH for throughput.
 */
export const conductDebate = async (draft: Draft, otherDrafts: Draft[], taskType: TaskType): Promise<Draft> => {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const others = otherDrafts.map(d => `${d.perspectiveRole} argues: "${d.keyPoint}"`).join("\n");
    
    const response = await ai.models.generateContent({
      model: FLASH_MODEL,
      contents: `You are ${draft.perspectiveRole}. 
      Review your white paper and the key points from other council members:
      
      Your White Paper: ${draft.whitePaper}
      
      Other Council Voices:
      ${others}
      
      Task: Provide a debate critique. How do their views conflict with or enhance yours? 
      Update your white paper and friction point based on this adversarial validation.
      
      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            debateCritique: { type: Type.STRING },
            whitePaper: { type: Type.STRING },
            frictionPoint: { type: Type.STRING },
          },
          required: ["debateCritique", "whitePaper", "frictionPoint"]
        }
      }
    });

    const data = JSON.parse(cleanJson(response.text || "{}"));
    return {
      ...draft,
      ...data
    };
  });
};

/**
 * Synthesizes all drafts. Uses PRO for maximum reasoning depth in the final synthesis.
 */
export const synthesizeSimulation = async (goal: string, drafts: Draft[], perspectives: SimulationProfile[], taskType: TaskType): Promise<Partial<PromptUpgradeResult>> => {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const summaries = drafts.map(d => `[${d.perspectiveRole}]\nWhite Paper: ${d.whitePaper}\nFriction: ${d.frictionPoint}`).join("\n\n");
    
    const config: any = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          finalDraft: { type: Type.STRING },
          improvedPrompt: { type: Type.STRING },
          whyItIsBetter: { type: Type.ARRAY, items: { type: Type.STRING } },
          generalizableInsight: { type: Type.STRING },
          simulationTensions: { type: Type.ARRAY, items: { type: Type.STRING } },
          collisionMap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                personaA: { type: Type.STRING },
                personaB: { type: Type.STRING },
                tension: { type: Type.STRING },
                resolution: { type: Type.STRING },
              },
              required: ["personaA", "personaB", "tension", "resolution"]
            }
          },
          sacrificeLog: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sacrifice: { type: Type.STRING },
                reason: { type: Type.STRING },
                risk: { type: Type.STRING },
              },
              required: ["sacrifice", "reason", "risk"]
            }
          },
          redlines: { type: Type.ARRAY, items: { type: Type.STRING } },
          followUpQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          concreteDemonstration: {
            type: Type.OBJECT,
            properties: {
              workingExample: { type: Type.STRING },
              actionableStructure: { type: Type.ARRAY, items: { type: Type.STRING } },
              specs: {
                type: Type.OBJECT,
                properties: {
                  variables: { type: Type.ARRAY, items: { type: Type.STRING } },
                  references: { type: Type.STRING },
                  toneMood: { type: Type.STRING },
                },
                required: ["variables", "references", "toneMood"]
              }
            },
            required: ["workingExample", "actionableStructure", "specs"]
          }
        },
        required: ["finalDraft", "improvedPrompt", "whyItIsBetter", "generalizableInsight", "sacrificeLog", "redlines", "followUpQuestions", "collisionMap", "concreteDemonstration"]
      }
    };

    if (taskType === 'B') {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: `As the Executive Council Lead, synthesize the following perspectives on the goal: "${goal}"
      
      Council Transcripts:
      ${summaries}
      
      Your mission:
      1. Create a Master Plan (finalDraft).
      2. Design an Improved Prompt (improvedPrompt).
      ${taskType === 'A' ? `
      3. MANDATORY: As this is a Creative/Generative task (Type A), provide a 'CONCRETE DEMONSTRATION' section that bridges theory to execution.
         - workingExample: Provide a 1-2 page (long-form) actual output demonstrating the concepts discussed.
         - actionableStructure: Convert high-level frameworks into numbered steps or sequential elements.
         - specs: Define variables, comparison references ("similar to X but with Y adjustment"), and tone/mood examples.
      ` : ''}
      ${taskType === 'B' ? 'IMPORTANT: Verify collective claims using web search to ensure technical and regulatory accuracy (Logic Lineage).' : ''}
      Return JSON.`,
      config: config
    });

    const data = JSON.parse(cleanJson(response.text || "{}"));
    const sources = extractSourcesFromResponse(response);

    return {
      ...data,
      taskType,
      sources: sources.length > 0 ? sources : undefined,
      metadata: {
        promptVersion: "5.1.0-QuotaOptimized",
        model: PRO_MODEL
      }
    };
  });
};
