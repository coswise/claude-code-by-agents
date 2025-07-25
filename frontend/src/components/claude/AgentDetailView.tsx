import { Copy, Clock, FileText, GitBranch } from "lucide-react";
import { getAgentById } from "../../config/agents";
import type { AllMessage } from "../../types";

interface AgentDetailViewProps {
  agentId: string;
  messages: AllMessage[];
  sessionId: string | null;
}

export function AgentDetailView({ agentId, messages, sessionId }: AgentDetailViewProps) {
  const agent = getAgentById(agentId);
  
  if (!agent) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Agent Not Found</h3>
          <p className="text-gray-500">The requested agent could not be found.</p>
        </div>
      </div>
    );
  }

  const chatMessages = messages.filter(msg => msg.type === "chat");
  const lastActivity = chatMessages.length > 0 
    ? new Date(chatMessages[chatMessages.length - 1].timestamp).toLocaleString()
    : "No activity yet";

  const copyPath = () => {
    navigator.clipboard.writeText(agent.workingDirectory);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Agent Header */}
        <div className="claude-card p-6 mb-6">
          <div className="flex items-start gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-semibold"
              style={{ backgroundColor: agent.color.replace('bg-', '').replace('-500', '') === 'blue' ? 'var(--agent-admin)' :
                agent.color.replace('bg-', '').replace('-500', '') === 'green' ? 'var(--agent-api)' :
                agent.color.replace('bg-', '').replace('-500', '') === 'purple' ? 'var(--agent-web)' :
                'var(--agent-kit)'
              }}
            >
              {agent.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{agent.name}</h1>
              <p className="text-gray-600 mb-4">{agent.description}</p>
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileText className="w-4 h-4" />
                <code className="bg-gray-100 px-2 py-1 rounded font-mono">
                  {agent.workingDirectory}
                </code>
                <button
                  onClick={copyPath}
                  className="p-1 hover:bg-gray-100 rounded transition-all"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="claude-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{chatMessages.length}</div>
                <div className="text-sm text-gray-500">Messages</div>
              </div>
            </div>
          </div>

          <div
            className="claude-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {sessionId ? "Active" : "Idle"}
                </div>
                <div className="text-sm text-gray-500">Status</div>
              </div>
            </div>
          </div>

          <div
            className="claude-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {agent.workingDirectory.split('/').pop()}
                </div>
                <div className="text-sm text-gray-500">Project</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="claude-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          
          {chatMessages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500">No conversation history yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Switch to Chat with Agents to start talking with this agent
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Last activity: {lastActivity}</span>
                <span>Session: {sessionId ? sessionId.substring(0, 8) + "..." : "None"}</span>
              </div>
              
              {/* Message History (Read-only) */}
              <div className="border-t border-gray-100 pt-4">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {chatMessages.slice(-5).map((message, index) => (
                    <div key={index} className="flex gap-3 text-sm">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        message.role === "user" ? "bg-gray-400" : "bg-blue-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {message.role === "user" ? "You" : agent.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-600 line-clamp-2">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {chatMessages.length > 5 && (
                  <div className="text-center mt-4">
                    <span className="text-sm text-gray-400">
                      Showing last 5 messages of {chatMessages.length} total
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Working Directory Info */}
        <div className="claude-card p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Agent ID</span>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">{agent.id}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Working Directory</span>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">{agent.workingDirectory}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className="text-sm text-green-600 font-medium">Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}