
import { SimulationProfile, TaskType } from '../types';

export interface ExampleScenario {
  id: string;
  title: string;
  description: string;
  goal: string;
  source: string;
  taskType: TaskType;
  perspectives: SimulationProfile[];
}

export const EXAMPLE_SCENARIOS: ExampleScenario[] = [
  {
    id: 'tech-stack',
    title: 'Startup Tech Stack Decision',
    description: 'Resolve the Postgres vs MongoDB debate for a new SaaS platform.',
    taskType: 'B',
    goal: "We're a 5-person startup building a SaaS analytics platform. Should we use Postgres or MongoDB for our primary database? We expect heavy read/write operations and need to scale fast.",
    source: "Current team expertise is primarily JavaScript/Node.js. Expected initial scale: 10,000 events/sec. Budget is tight ($500/mo for infra).",
    perspectives: [
      {
        id: 'ex1-1',
        role: 'CTO',
        directive: 'Maximize development velocity and long-term scalability.',
        heuristics: 'Choose tools with the strongest community and hiring pool.',
        vibe: 'Pragmatic, high-energy, skeptical of hype.',
        constraints: 'Limit infrastructure complexity for the initial MVP.',
        seed: 'Velocity is the only metric.',
        fidelityScore: 1.0,
        isHighFidelity: true
      },
      {
        id: 'ex1-2',
        role: 'DevOps Engineer',
        directive: 'Ensure zero-touch maintenance and clear observability.',
        heuristics: 'Managed services are always cheaper than human hours.',
        vibe: 'Cynical about "magic" scaling solutions.',
        constraints: 'Deployment must be automated via Terraform/CI.',
        seed: 'If I have to wake up at 3 AM, it is a bad choice.',
        fidelityScore: 1.0,
        isHighFidelity: true
      },
      {
        id: 'ex1-3',
        role: 'Database Architect',
        directive: 'Maintain strict data integrity and query performance.',
        heuristics: 'Schema-on-read is usually a technical debt trap.',
        vibe: 'Pedantic, rigorous, values relational constraints.',
        constraints: 'ACID compliance is non-negotiable for billing data.',
        seed: 'Data lives longer than code.',
        fidelityScore: 1.0,
        isHighFidelity: true
      },
      {
        id: 'ex1-4',
        role: 'FinOps Specialist',
        directive: 'Minimize cloud billing sprawl.',
        heuristics: 'Idle resources are wasted capital.',
        vibe: 'Frugal, data-driven, margin-obsessed.',
        constraints: 'Must stay within the $500 monthly infrastructure cap.',
        seed: 'Profitability starts at the database layer.',
        fidelityScore: 1.0,
        isHighFidelity: true
      }
    ]
  },
  {
    id: 'feature-prioritization',
    title: 'Strategic Feature Priority',
    description: 'Audit whether to build AI Search or Multi-language support next.',
    taskType: 'B',
    goal: "Should we build AI-powered semantic search or native multi-language support (i18n) for our enterprise dashboard next quarter? We have limited engineering capacity.",
    source: "Customer base: 70% USA, 30% Europe. Sales feedback says European expansion is stalled by language issues. Product feedback says search is 'broken'.",
    perspectives: [
      {
        id: 'ex2-1',
        role: 'Head of Product',
        directive: 'Optimize for the highest impact on MRR retention.',
        heuristics: 'Follow the loudest pain point that affects the most users.',
        vibe: 'Diplomatic but firm on roadmap alignment.',
        constraints: 'Feature must be shippable within a 12-week sprint.',
        seed: 'Solve the problem, don\'t just ship the tech.',
        fidelityScore: 1.0,
        isHighFidelity: true
      },
      {
        id: 'ex2-2',
        role: 'Engineering Lead',
        directive: 'Minimize technical debt and implementation risk.',
        heuristics: 'AI features are easy to demo but hard to maintain.',
        vibe: 'Realistic, focused on system stability.',
        constraints: 'Current search infrastructure is legacy ElasticSearch.',
        seed: 'Stability over novelty.',
        fidelityScore: 1.0,
        isHighFidelity: true
      },
      {
        id: 'ex2-3',
        role: 'Customer Success',
        directive: 'Protect the existing user experience.',
        heuristics: 'Expansion is useless if churn is high.',
        vibe: 'Empathetic, defensive of current users.',
        constraints: 'Support team cannot handle more complexity in search UI.',
        seed: 'Make the current customers happy first.',
        fidelityScore: 1.0,
        isHighFidelity: true
      },
      {
        id: 'ex2-4',
        role: 'Sales VP',
        directive: 'Unlock new market segments and larger deal sizes.',
        heuristics: 'The enterprise wants checkboxes we don\'t have.',
        vibe: 'Aggressive, growth-oriented, short-term focused.',
        constraints: 'Needs a feature that looks impressive in high-stakes demos.',
        seed: 'Close the gap between us and the market leader.',
        fidelityScore: 1.0,
        isHighFidelity: true
      }
    ]
  },
  {
    id: 'hiring-strategy',
    title: 'Hiring Decision Audit',
    description: 'Decide between one Senior Engineer or two Mid-level hires.',
    taskType: 'B',
    goal: "We have a total salary budget of $220K. Should we hire one senior engineer at $180K or two mid-level engineers at $110K each? We have a backlog of technical debt and new features.",
    source: "Current team: 1 CTO, 2 Juniors. The CTO is overwhelmed with code reviews and cannot focus on architecture.",
    perspectives: [
      {
        id: 'ex3-1',
        role: 'CTO',
        directive: 'Build a sustainable technical foundation.',
        heuristics: 'One senior is worth five juniors in an architectural crisis.',
        vibe: 'Burned out, looking for a peer to delegate to.',
        constraints: 'Cannot spend more than 5 hours/week on mentoring.',
        seed: 'I need someone who can tell me I\'m wrong.',
        fidelityScore: 1.0,
        isHighFidelity: true
      },
      {
        id: 'ex3-2',
        role: 'CFO',
        directive: 'Maintain 18 months of runway.',
        heuristics: 'Headcount is the most expensive liability.',
        vibe: 'Conservative, focused on burn rates.',
        constraints: 'Total compensation includes 20% overhead for benefits.',
        seed: 'The spreadsheet never lies.',
        fidelityScore: 1.0,
        isHighFidelity: true
      },
      {
        id: 'ex3-3',
        role: 'Engineering Manager',
        directive: 'Improve team velocity and output volume.',
        heuristics: 'Parallel work streams require more hands, not just better brains.',
        vibe: 'Agile-focused, process-oriented.',
        constraints: 'Backlog is growing faster than we can prune it.',
        seed: 'Velocity is a function of bandwidth.',
        fidelityScore: 1.0,
        isHighFidelity: true
      },
      {
        id: 'ex3-4',
        role: 'Talent Lead',
        directive: 'Ensure successful hiring and retention.',
        heuristics: 'The market for $180k seniors is currently hyper-competitive.',
        vibe: 'Market-savvy, relationship-focused.',
        constraints: 'Hiring two mids takes 2x the interview time.',
        seed: 'Culture fit is harder to find in seniors.',
        fidelityScore: 1.0,
        isHighFidelity: true
      }
    ]
  }
];
