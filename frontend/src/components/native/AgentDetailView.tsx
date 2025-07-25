import { Copy, Clock, FileText, GitBranch } from "lucide-react";
import { getAgentById } from "../../config/agents";
import type { AllMessage } from "../../types";

interface AgentDetailViewProps {
  agentId: string;
  messages: AllMessage[];
  sessionId: string | null;
}

const agentColors = {
  "readymojo-admin": "var(--agent-admin)",
  "readymojo-api": "var(--agent-api)", 
  "readymojo-web": "var(--agent-web)",
  "peakmojo-kit": "var(--agent-kit)",
};

export function AgentDetailView({ agentId, messages, sessionId }: AgentDetailViewProps) {
  const agent = getAgentById(agentId);
  
  if (!agent) {
    return (
      <div className="agent-detail">
        <div className="agent-detail-content">
          <div className="empty-state">
            <div className="empty-state-icon">❌</div>
            <h3>Agent Not Found</h3>
            <p>The requested agent could not be found.</p>
          </div>
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
    <div className="agent-detail">
      <div className="agent-detail-content">
        {/* Agent Header */}
        <div className="agent-detail-header">
          <div 
            className="agent-detail-icon"
            style={{ backgroundColor: agentColors[agent.id as keyof typeof agentColors] }}
          >
            {agent.name.charAt(0)}
          </div>
          <div className="agent-detail-info">
            <h1>{agent.name}</h1>
            <p>{agent.description}</p>
            
            <div className="agent-detail-path">
              <FileText size={14} />
              <span>{agent.workingDirectory}</span>
              <button onClick={copyPath} className="agent-detail-copy">
                <Copy size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="agent-stats">
          <div className="agent-stat-card">
            <div className="agent-stat-header">
              <div 
                className="agent-stat-icon"
                style={{ backgroundColor: "var(--agent-admin)" }}
              >
                <FileText size={16} />
              </div>
              <div>
                <div className="agent-stat-value">{chatMessages.length}</div>
                <div className="agent-stat-label">Messages</div>
              </div>
            </div>
          </div>

          <div className="agent-stat-card">
            <div className="agent-stat-header">
              <div 
                className="agent-stat-icon"
                style={{ backgroundColor: "var(--agent-api)" }}
              >
                <Clock size={16} />
              </div>
              <div>
                <div className="agent-stat-value">
                  {sessionId ? "Active" : "Idle"}
                </div>
                <div className="agent-stat-label">Status</div>
              </div>
            </div>
          </div>

          <div className="agent-stat-card">
            <div className="agent-stat-header">
              <div 
                className="agent-stat-icon"
                style={{ backgroundColor: "var(--agent-web)" }}
              >
                <GitBranch size={16} />
              </div>
              <div>
                <div className="agent-stat-value">
                  {agent.workingDirectory.split('/').pop()}
                </div>
                <div className="agent-stat-label">Project</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="agent-detail-header">
          <div style={{ width: "100%" }}>
            <h2 style={{ 
              fontSize: "16px", 
              fontWeight: 600, 
              margin: "0 0 16px 0",
              color: "var(--claude-text-primary)" 
            }}>
              Recent Activity
            </h2>
            
            {chatMessages.length === 0 ? (
              <div className="empty-state">
                <div 
                  className="empty-state-icon"
                  style={{
                    width: "48px",
                    height: "48px",
                    fontSize: "20px",
                    background: "var(--claude-border)"
                  }}
                >
                  <FileText size={20} />
                </div>
                <h3>No conversation history yet</h3>
                <p>Switch to Chat with Agents to start talking with this agent</p>
              </div>
            ) : (
              <div>
                <div 
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    color: "var(--claude-text-muted)",
                    marginBottom: "16px"
                  }}
                >
                  <span>Last activity: {lastActivity}</span>
                  <span>Session: {sessionId ? sessionId.substring(0, 8) + "..." : "None"}</span>
                </div>
                
                {/* Message History (Read-only) */}
                <div style={{ borderTop: "1px solid var(--claude-border)", paddingTop: "16px" }}>
                  <div 
                    style={{
                      maxHeight: "400px",
                      overflowY: "auto"
                    }}
                  >
                    {chatMessages.slice(-5).map((message, index) => (
                      <div 
                        key={index} 
                        style={{
                          display: "flex",
                          gap: "12px",
                          fontSize: "13px",
                          marginBottom: "12px"
                        }}
                      >
                        <div 
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: message.role === "user" ? "var(--claude-border)" : agentColors[agent.id as keyof typeof agentColors],
                            marginTop: "8px",
                            flexShrink: 0
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div 
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "4px"
                            }}
                          >
                            <span 
                              style={{
                                fontWeight: 500,
                                color: "var(--claude-text-primary)"
                              }}
                            >
                              {message.role === "user" ? "You" : agent.name}
                            </span>
                            <span 
                              style={{
                                fontSize: "11px",
                                color: "var(--claude-text-muted)"
                              }}
                            >
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p 
                            style={{
                              color: "var(--claude-text-secondary)",
                              margin: 0,
                              lineHeight: 1.4,
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical"
                            }}
                          >
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {chatMessages.length > 5 && (
                    <div 
                      style={{
                        textAlign: "center",
                        marginTop: "16px",
                        fontSize: "12px",
                        color: "var(--claude-text-muted)"
                      }}
                    >
                      Showing last 5 messages of {chatMessages.length} total
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Configuration */}
        <div className="agent-detail-header">
          <div style={{ width: "100%" }}>
            <h2 style={{ 
              fontSize: "16px", 
              fontWeight: 600, 
              margin: "0 0 16px 0",
              color: "var(--claude-text-primary)" 
            }}>
              Configuration
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--claude-text-secondary)" }}>Agent ID</span>
                <code 
                  style={{
                    fontSize: "12px",
                    background: "var(--claude-border)",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontFamily: "'SF Mono', Monaco, monospace"
                  }}
                >
                  {agent.id}
                </code>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--claude-text-secondary)" }}>Working Directory</span>
                <code 
                  style={{
                    fontSize: "12px",
                    background: "var(--claude-border)",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontFamily: "'SF Mono', Monaco, monospace"
                  }}
                >
                  {agent.workingDirectory}
                </code>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--claude-text-secondary)" }}>Status</span>
                <span 
                  style={{
                    fontSize: "13px",
                    color: "var(--claude-success)",
                    fontWeight: 500
                  }}
                >
                  Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}