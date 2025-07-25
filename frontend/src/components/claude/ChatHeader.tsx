import { Users, User, MoreHorizontal, Download, Trash2 } from "lucide-react";
import { getAgentById } from "../../config/agents";
import { useState } from "react";

interface ChatHeaderProps {
  currentMode: "group" | "agent";
  activeAgentId: string | null;
  onModeToggle: () => void;
}

export function ChatHeader({ currentMode, activeAgentId, onModeToggle }: ChatHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const currentAgent = activeAgentId ? getAgentById(activeAgentId) : null;

  return (
    <div className="claude-card m-4 mb-0 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Mode Display */}
        <div className="flex items-center gap-3">
          {currentMode === "group" ? (
            <>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Chat with Agents</h2>
                <p className="text-sm text-gray-500">@mention to call out agents</p>
              </div>
            </>
          ) : (
            <>
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: currentAgent?.color.replace('bg-', '').replace('-500', '') === 'blue' ? 'var(--agent-admin)' :
                  currentAgent?.color.replace('bg-', '').replace('-500', '') === 'green' ? 'var(--agent-api)' :
                  currentAgent?.color.replace('bg-', '').replace('-500', '') === 'purple' ? 'var(--agent-web)' :
                  'var(--agent-kit)'
                }}
              >
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{currentAgent?.name}</h2>
                <p className="text-sm text-gray-500 font-mono">
                  {currentAgent?.workingDirectory.split('/').pop()}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Toggle Mode Button */}
          <button
            onClick={onModeToggle}
            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all"
          >
            {currentMode === "group" ? "Switch to Agent" : "Switch to Group"}
          </button>

          {/* More Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-all"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 claude-card p-1 z-10">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all">
                  <Download className="w-4 h-4" />
                  Export Conversation
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 className="w-4 h-4" />
                  Clear History
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Working Directory Info (Agent Mode) */}
      {currentMode === "agent" && currentAgent && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Working Directory:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
              {currentAgent.workingDirectory}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(currentAgent.workingDirectory)}
              className="ml-auto text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}