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
  version?: string;
}

const DEFAULT_AGENTS: Agent[] = [
  {
    id: "orchestrator",
    name: "Orchestrator Agent",
    workingDirectory: "/tmp/orchestrator",
    color: "bg-gradient-to-r from-blue-500 to-purple-500",
    description: "Intelligent orchestrator that coordinates multi-agent workflows",
    apiEndpoint: "https://api.claudecode.run",
    isOrchestrator: true
  },
  {
    id: "tians-twitter",
    name: "Tian's Twitter",
    workingDirectory: "/Users/administrator/awesome-claude-code-agents/twitter_agents/twitter_tian",
    color: "bg-gradient-to-r from-blue-400 to-blue-600",
    description: "An twitter agent that use browser to engage twitter as Tian Lan persona",
    apiEndpoint: "http://207.254.39.121:8080",
    isOrchestrator: false
  }
];

const DEFAULT_CONFIG: AgentSystemConfig = {
  agents: DEFAULT_AGENTS,
};

const STORAGE_KEY = "agent-system-config";
const CONFIG_VERSION = "1.1"; // Increment this when DEFAULT_AGENTS changes

export function useAgentConfig() {
  const [config, setConfig] = useState<AgentSystemConfig>(DEFAULT_CONFIG);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize config on client side
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedConfig = JSON.parse(saved);
        
        // Check if config version is outdated or missing
        const savedVersion = parsedConfig.version || "1.0";
        const needsUpdate = savedVersion !== CONFIG_VERSION;
        
        if (needsUpdate) {
          console.log(`Updating agent config from version ${savedVersion} to ${CONFIG_VERSION}`);
          // Use default agents when version changes to ensure updates are applied
          const newConfig = { ...DEFAULT_CONFIG, version: CONFIG_VERSION };
          setConfig(newConfig);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
        } else {
          // Merge saved config with default agents to ensure new agents appear
          const existingAgentIds = new Set(parsedConfig.agents?.map((a: Agent) => a.id) || []);
          const newDefaultAgents = DEFAULT_CONFIG.agents.filter(agent => !existingAgentIds.has(agent.id));
          
          const mergedConfig = {
            agents: [...(parsedConfig.agents || []), ...newDefaultAgents],
            version: CONFIG_VERSION
          };
          setConfig(mergedConfig);
          
          // Save the merged config if new agents were added
          if (newDefaultAgents.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedConfig));
          }
        }
      } else {
        // No saved config, use defaults
        const newConfig = { ...DEFAULT_CONFIG, version: CONFIG_VERSION };
        setConfig(newConfig);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      }
    } catch (error) {
      console.warn("Failed to load agent configuration:", error);
      const newConfig = { ...DEFAULT_CONFIG, version: CONFIG_VERSION };
      setConfig(newConfig);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
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