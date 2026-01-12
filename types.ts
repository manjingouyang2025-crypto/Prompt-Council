
export type TaskType = 'A' | 'B';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface SimulationProfile {
  id: string;
  role: string;
  directive: string;      
  heuristics: string;     
  vibe: string;           
  constraints: string;    
  seed: string;           
  rationale?: string;     
  sourceText?: string;    
  extractedBiases?: string[];
  isHighFidelity?: boolean;
  fidelityScore: number; 
}

export interface Draft {
  perspectiveId: string;
  perspectiveRole: string;
  content: string;
  keyPoint: string;
  frictionPoint: string; 
  whitePaper: string;
  debateCritique?: string;
  sources?: GroundingSource[];
  brief?: {
    coreThesis: string;
    evidenceSnippets: string[];
    technicalConstraints: string[];
  };
}

export interface CollisionPoint {
  personaA: string;
  personaB: string;
  tension: string;
  resolution: string;
}

export interface Sacrifice {
  sacrifice: string;
  reason: string;
  risk: string;
}

export interface ConcreteDemonstration {
  workingExample: string;
  actionableStructure: string[];
  specs: {
    variables: string[];
    references: string;
    toneMood: string;
  };
}

export interface PromptUpgradeResult {
  finalDraft: string;
  improvedPrompt: string;
  whyItIsBetter: string[];
  generalizableInsight: string;
  simulationTensions: string[]; 
  collisionMap: CollisionPoint[];
  sacrificeLog: Sacrifice[];
  redlines: string[];
  followUpQuestions: string[];
  drafts: Draft[];
  taskType?: TaskType;
  sources?: GroundingSource[];
  concreteDemonstration?: ConcreteDemonstration;
  metadata: {
    promptVersion: string;
    model: string;
  };
}

export interface SavedPrompt {
  id: string;
  label: string;
  content: string;
  timestamp: number;
}

export interface RunHistoryItem {
  id: string;
  timestamp: number;
  originalGoal: string;
  perspectives: SimulationProfile[];
  result: PromptUpgradeResult;
}

export const AppStatus = {
  IDLE: 'IDLE',
  PROCESSING: 'PROCESSING', 
  DEBATING: 'DEBATING',
  COMPLETE: 'COMPLETE',
  ERROR: 'ERROR'
} as const;

export type AppStatusType = typeof AppStatus[keyof typeof AppStatus];
