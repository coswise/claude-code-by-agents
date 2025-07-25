import { Send, Paperclip, AtSign, StopCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { PREDEFINED_AGENTS } from "../../config/agents";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  currentRequestId: string | null;
  activeAgentId: string | null;
  currentMode: "group" | "agent";
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onAbort: () => void;
  onAgentSwitch: (agentId: string) => void;
}

export function ChatInput({
  input,
  isLoading,
  currentRequestId,
  activeAgentId,
  currentMode,
  onInputChange,
  onSubmit,
  onAbort,
  onAgentSwitch,
}: ChatInputProps) {
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = Math.min(textarea.scrollHeight, 150); // max 6 lines
      textarea.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  // Focus on textarea when not loading
  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Check for @mentions in group mode
    if (currentMode === "group") {
      const mentionMatch = input.match(/^@(\w+(?:-\w+)*)\s+(.*)$/);
      if (mentionMatch) {
        const [, agentId, cleanMessage] = mentionMatch;
        const agent = PREDEFINED_AGENTS.find(a => a.id === agentId);
        if (agent) {
          onAgentSwitch(agent.id);
          onInputChange(cleanMessage);
          return;
        }
      }
    }

    onSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const insertMention = (agentId: string) => {
    const mention = `@${agentId} `;
    onInputChange(mention + input);
    setShowAgentPicker(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="p-4">
      <div className="claude-input p-4 relative">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          {/* Left Toolbar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-all"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* @ Mention Button (Group Mode Only) */}
            {currentMode === "group" && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAgentPicker(!showAgentPicker)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-all"
                >
                  <AtSign className="w-4 h-4" />
                </button>

                {/* Agent Picker Dropdown */}
                {showAgentPicker && (
                  <div className="absolute bottom-full mb-2 left-0 w-64 claude-card p-2 z-10">
                    <div className="text-xs font-semibold text-gray-500 mb-2 px-2">
                      Mention Agent
                    </div>
                    {PREDEFINED_AGENTS.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => insertMention(agent.id)}
                        className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-gray-50 rounded-lg transition-all text-left"
                      >
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: agent.color.replace('bg-', '').replace('-500', '') === 'blue' ? 'var(--agent-admin)' :
                            agent.color.replace('bg-', '').replace('-500', '') === 'green' ? 'var(--agent-api)' :
                            agent.color.replace('bg-', '').replace('-500', '') === 'purple' ? 'var(--agent-web)' :
                            'var(--agent-kit)'
                          }}
                        />
                        <span className="font-medium">@{agent.id}</span>
                        <span className="text-gray-500 text-xs">{agent.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input Field */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                currentMode === "group" 
                  ? "Chat with agents or @mention specific agent..."
                  : activeAgentId 
                    ? `Message ${PREDEFINED_AGENTS.find(a => a.id === activeAgentId)?.name}...`
                    : "Select an agent to start chatting..."
              }
              disabled={isLoading}
              className="w-full bg-transparent border-none outline-none resize-none text-sm placeholder:text-gray-400"
              rows={1}
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isLoading && currentRequestId ? (
              <button
                type="button"
                onClick={onAbort}
                className="p-2 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
              >
                <StopCircle className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() || isLoading || (currentMode === "agent" && !activeAgentId)}
                className={`p-2 rounded-lg transition-all ${
                  input.trim() && (currentMode === "group" || activeAgentId)
                    ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    : "text-gray-300 cursor-not-allowed"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Input Helper Text */}
        <div className="mt-2 text-xs text-gray-400">
          {currentMode === "group" ? (
            "Press Enter to send • Use @agent-name to switch context"
          ) : (
            "Press Enter to send • Shift+Enter for new line"
          )}
        </div>
      </div>
    </div>
  );
}