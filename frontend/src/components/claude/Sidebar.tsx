import { MessageCircle, Settings, Plus } from "lucide-react";
import { PREDEFINED_AGENTS } from "../../config/agents";

interface SidebarProps {
  activeAgentId: string | null;
  agentSessions: Record<string, { sessionId: string | null; messages: any[] }>;
  onAgentSelect: (agentId: string) => void;
  onNewGroupChat: () => void;
  currentMode: "group" | "agent";
  onModeChange: (mode: "group" | "agent") => void;
}

const agentColors = {
  "readymojo-admin": "var(--agent-admin)",
  "readymojo-api": "var(--agent-api)", 
  "readymojo-web": "var(--agent-web)",
  "peakmojo-kit": "var(--agent-kit)",
};

export function Sidebar({ 
  activeAgentId, 
  agentSessions, 
  onAgentSelect, 
  onNewGroupChat,
  currentMode,
  onModeChange 
}: SidebarProps) {
  return (
    <div className="claude-sidebar w-[240px] h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">CodeByAgents</h1>
            <p className="text-xs text-gray-500">Multi-Agent Code Collaboration</p>
          </div>
        </div>

        {/* Chat with Agents Button */}
        <button
          onClick={onNewGroupChat}
          className={`
            w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
            ${currentMode === "group" 
              ? "bg-blue-100 text-blue-700 border border-blue-200" 
              : "hover:bg-gray-100 text-gray-600"
            }
          `}
        >
          <Plus className="w-4 h-4" />
          Chat with Agents
          {currentMode === "group" && (
            <div className="w-2 h-2 rounded-full bg-blue-500 ml-auto" />
          )}
        </button>
      </div>

      {/* Agents List */}
      <div className="flex-1 p-2">
        <div className="mb-3 px-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Agents
          </h3>
        </div>
        
        <div className="space-y-1">
          {PREDEFINED_AGENTS.map((agent) => {
            const isActive = activeAgentId === agent.id && currentMode === "agent";
            const hasMessages = agentSessions[agent.id]?.messages.length > 0;
            const messageCount = agentSessions[agent.id]?.messages.length || 0;
            
            return (
              <button
                key={agent.id}
                onClick={() => {
                  onAgentSelect(agent.id);
                  onModeChange("agent");
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all
                  ${isActive 
                    ? "bg-white shadow-sm border border-gray-200" 
                    : "hover:bg-gray-50"
                  }
                `}
              >
                {/* Agent Indicator */}
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: agentColors[agent.id as keyof typeof agentColors] }}
                />
                
                {/* Agent Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {agent.name}
                    </span>
                    {hasMessages && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {messageCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {agent.description}
                  </p>
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-all">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </div>
  );
}