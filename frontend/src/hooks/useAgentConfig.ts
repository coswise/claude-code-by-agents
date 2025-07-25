import { useState, useEffect } from "react";

export interface Agent {
  id: string;
  name: string;
  workingDirectory: string;
  color: string;
  description: string;
  apiEndpoint: string;
  isOrchestrator?: boolean;
}

export interface AgentSystemConfig {
  agents: Agent[];
}

const DEFAULT_AGENTS: Agent[] = [
  {
    id: "group-chat",
    name: "Chat with Agents",
    workingDirectory: "/Users/buryhuang/git/group-chat-agent",
    color: "bg-gradient-to-r from-blue-500 to-purple-500",
    description: "Intelligent orchestrator that coordinates multi-agent workflows",
    apiEndpoint: "http://localhost:8080",
    isOrchestrator: true
  },
  {
    id: "readymojo-admin",
    name: "ReadyMojo Admin",
    workingDirectory: "/Users/buryhuang/git/readymojo-admin",
    color: "bg-blue-500",
    description: "Admin dashboard and management interface",
    apiEndpoint: "http://localhost:8080"
  },
  {
    id: "readymojo-api",
    name: "ReadyMojo API",
    workingDirectory: "/Users/buryhuang/git/readymojo-api",
    color: "bg-green-500",
    description: "Backend API and server logic",
    apiEndpoint: "http://localhost:8080"
  },
  {
    id: "readymojo-web",
    name: "ReadyMojo Web",
    workingDirectory: "/Users/buryhuang/git/readymojo-web",
    color: "bg-purple-500",
    description: "Frontend web application",
    apiEndpoint: "http://localhost:8080"
  },
  {
    id: "peakmojo-livekit",
    name: "PeakMojo LiveKit",
    workingDirectory: "/Users/buryhuang/git/peakmojo-livekit",
    color: "bg-orange-500",
    description: "LiveKit Voice Integration for PeakMojo",
    apiEndpoint: "http://localhost:8080"
  }
];

const DEFAULT_CONFIG: AgentSystemConfig = {
  agents: DEFAULT_AGENTS,
};

const STORAGE_KEY = "agent-system-config";

export function useAgentConfig() {
  const [config, setConfig] = useState<AgentSystemConfig>(DEFAULT_CONFIG);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize config on client side
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedConfig = JSON.parse(saved);
        setConfig({
          agents: parsedConfig.agents || DEFAULT_CONFIG.agents,
        });
      }
    } catch (error) {
      console.warn("Failed to load agent configuration:", error);
      setConfig(DEFAULT_CONFIG);
    }
    setIsInitialized(true);
  }, []);

  const updateConfig = (newConfig: Partial<AgentSystemConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
    } catch (error) {
      console.error("Failed to save agent configuration:", error);
    }
  };

  const addAgent = (agent: Agent) => {
    // Auto-assign orchestrator status if this is the first agent
    const isFirstAgent = config.agents.length === 0;
    const agentWithOrchestratorStatus = {
      ...agent,
      isOrchestrator: isFirstAgent
    };
    
    const updatedAgents = [...config.agents, agentWithOrchestratorStatus];
    updateConfig({ agents: updatedAgents });
  };

  const updateAgent = (agentId: string, updates: Partial<Agent>) => {
    const updatedAgents = config.agents.map(agent =>
      agent.id === agentId ? { ...agent, ...updates } : agent
    );
    updateConfig({ agents: updatedAgents });
  };

  const removeAgent = (agentId: string) => {
    const updatedAgents = config.agents.filter(agent => agent.id !== agentId);
    updateConfig({ agents: updatedAgents });
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to reset agent configuration:", error);
    }
  };

  const getAgentById = (id: string): Agent | undefined => {
    return config.agents.find(agent => agent.id === id);
  };

  const getWorkerAgents = (): Agent[] => {
    return config.agents.filter(agent => !agent.isOrchestrator);
  };

  const getOrchestratorAgent = (): Agent | undefined => {
    return config.agents.find(agent => agent.isOrchestrator);
  };

  return {
    config,
    updateConfig,
    addAgent,
    updateAgent,
    removeAgent,
    resetConfig,
    getAgentById,
    getWorkerAgents,
    getOrchestratorAgent,
    isInitialized,
  };
}