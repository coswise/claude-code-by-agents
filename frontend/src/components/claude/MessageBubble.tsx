import { User, Bot } from "lucide-react";
import { getAgentById } from "../../config/agents";
import type { ChatMessage } from "../../types";

interface MessageBubbleProps {
  message: ChatMessage;
  isLast?: boolean;
}

const agentColors = {
  "readymojo-admin": "var(--agent-admin)",
  "readymojo-api": "var(--agent-api)", 
  "readymojo-web": "var(--agent-web)",
  "peakmojo-kit": "var(--agent-kit)",
};

export function MessageBubble({ message, isLast = false }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const agent = message.agentId ? getAgentById(message.agentId) : null;
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex gap-3 ${isLast ? 'mb-6' : 'mb-4'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
        ) : (
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            style={{ 
              backgroundColor: agent 
                ? agentColors[agent.id as keyof typeof agentColors]
                : 'var(--claude-accent)'
            }}
          >
            <Bot className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-gray-900">
            {isUser ? "You" : agent?.name || "Claude"}
          </span>
          <span className="text-xs text-gray-500">
            {formatTime(message.timestamp)}
          </span>
          {agent && (
            <span className="text-xs text-gray-400 font-mono">
              @{agent.id}
            </span>
          )}
        </div>

        {/* Message Body */}
        <div className="claude-message p-4">
          <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-gray-800">
            {message.content}
          </pre>
        </div>
      </div>
    </div>
  );
}