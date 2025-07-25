export interface Agent {
  id: string;
  name: string;
  workingDirectory: string;
  color: string;
  description: string;
  isOrchestrator?: boolean; // Indicates if this agent orchestrates others
}

export const PREDEFINED_AGENTS: Agent[] = [
  {
    id: "group-chat",
    name: "Chat with Agents",
    workingDirectory: "/Users/buryhuang/git/group-chat-agent",
    color: "bg-gradient-to-r from-blue-500 to-purple-500",
    description: "Intelligent orchestrator that coordinates multi-agent workflows",
    isOrchestrator: true
  },
  {
    id: "readymojo-admin",
    name: "ReadyMojo Admin",
    workingDirectory: "/Users/buryhuang/git/readymojo-admin",
    color: "bg-blue-500",
    description: "Admin dashboard and management interface"
  },
  {
    id: "readymojo-api",
    name: "ReadyMojo API",
    workingDirectory: "/Users/buryhuang/git/readymojo-api",
    color: "bg-green-500",
    description: "Backend API and server logic"
  },
  {
    id: "readymojo-web",
    name: "ReadyMojo Web",
    workingDirectory: "/Users/buryhuang/git/readymojo-web",
    color: "bg-purple-500",
    description: "Frontend web application"
  },
  {
    id: "peakmojo-livekit",
    name: "PeakMojo LiveKit",
    workingDirectory: "/Users/buryhuang/git/peakmojo-livekit",
    color: "bg-orange-500",
    description: "LiveKit Voice Integration for PeakMojo"
  }
];

export const getAgentById = (id: string): Agent | undefined => {
  return PREDEFINED_AGENTS.find(agent => agent.id === id);
};

export const getAgentByName = (name: string): Agent | undefined => {
  return PREDEFINED_AGENTS.find(agent => 
    agent.name.toLowerCase() === name.toLowerCase()
  );
};

export const parseAgentMention = (message: string): { agentId: string | null; cleanMessage: string } => {
  const mentionMatch = message.match(/^@(\w+(?:-\w+)*)\s+(.*)$/);
  if (mentionMatch) {
    const [, agentId, cleanMessage] = mentionMatch;
    const agent = getAgentById(agentId);
    if (agent) {
      return { agentId: agent.id, cleanMessage };
    }
  }
  return { agentId: null, cleanMessage: message };
};

export const getOrchestratorAgent = (): Agent | undefined => {
  return PREDEFINED_AGENTS.find(agent => agent.isOrchestrator);
};

export const getWorkerAgents = (): Agent[] => {
  return PREDEFINED_AGENTS.filter(agent => !agent.isOrchestrator);
};