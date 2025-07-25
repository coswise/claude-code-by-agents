import { useState, useCallback, useEffect, useRef } from "react";
import type { ChatRequest, ChatMessage } from "../../types";
import { useTheme } from "../../hooks/useTheme";
import { useClaudeStreaming } from "../../hooks/useClaudeStreaming";
import { useChatState } from "../../hooks/chat/useChatState";
import { usePermissions } from "../../hooks/chat/usePermissions";
import { useAbortController } from "../../hooks/chat/useAbortController";
import { Sidebar } from "./Sidebar";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble"; 
import { ChatInput } from "./ChatInput";
import { AgentDetailView } from "./AgentDetailView";
import { PermissionDialog } from "../PermissionDialog";
import { getChatUrl } from "../../config/api";
import { KEYBOARD_SHORTCUTS } from "../../utils/constants";
import { getAgentById } from "../../config/agents";
import type { StreamingContext } from "../../hooks/streaming/useMessageProcessor";

export function AgentHubPage() {
  const [currentMode, setCurrentMode] = useState<"group" | "agent">("group");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useTheme(); // For theme switching support
  const { processStreamLine } = useClaudeStreaming();
  const { abortRequest, createAbortHandler } = useAbortController();

  const {
    messages,
    input,
    isLoading,
    currentSessionId,
    currentRequestId,
    hasReceivedInit,
    currentAssistantMessage,
    activeAgentId,
    agentSessions,
    setInput,
    setCurrentSessionId,
    setHasReceivedInit,
    setCurrentAssistantMessage,
    addMessage,
    updateLastMessage,
    clearInput,
    generateRequestId,
    resetRequestState,
    startRequest,
    switchToAgent,
  } = useChatState();

  const {
    permissionDialog,
    closePermissionDialog,
  } = usePermissions();

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle keyboard shortcuts
  const handleAbort = useCallback(() => {
    if (currentRequestId) {
      abortRequest(currentRequestId, isLoading, resetRequestState);
    }
  }, [currentRequestId, isLoading, abortRequest, resetRequestState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === KEYBOARD_SHORTCUTS.ABORT) {
        e.preventDefault();
        if (currentRequestId) {
          handleAbort();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentRequestId, handleAbort]);

  const handleAgentSwitch = useCallback((agentId: string) => {
    switchToAgent(agentId);
  }, [switchToAgent]);

  const handleModeToggle = useCallback(() => {
    setCurrentMode(prev => prev === "group" ? "agent" : "group");
  }, []);

  const handleNewGroupChat = useCallback(() => {
    setCurrentMode("group");
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    
    let targetAgentId = activeAgentId;
    let messageContent = input.trim();

    // Handle @ mentions in group mode
    if (currentMode === "group") {
      const mentionMatch = input.match(/^@(\w+(?:-\w+)*)\s+(.*)$/);
      if (mentionMatch) {
        const [, agentId, cleanMessage] = mentionMatch;
        const agent = getAgentById(agentId);
        if (agent) {
          targetAgentId = agent.id;
          messageContent = cleanMessage;
          switchToAgent(agent.id);
        }
      } else if (!activeAgentId) {
        // In group mode without active agent, require @ mention
        return;
      }
    }

    if (!targetAgentId) return;

    const requestId = generateRequestId();
    
    // Add user message
    const userMessage: ChatMessage = {
      type: "chat",
      role: "user",
      content: messageContent,
      timestamp: Date.now(),
      agentId: targetAgentId,
    };
    addMessage(userMessage);

    clearInput();
    startRequest();

    // Set up streaming context
    const streamingContext: StreamingContext = {
      hasReceivedInit,
      currentAssistantMessage,
      setHasReceivedInit,
      setCurrentAssistantMessage,
      onSessionId: setCurrentSessionId,
      addMessage: (msg) => addMessage(msg),
      updateLastMessage,
    };

    try {
      const currentAgent = getAgentById(targetAgentId);
      if (!currentAgent) return;

      const chatRequest: ChatRequest = {
        message: messageContent,
        sessionId: currentSessionId || undefined,
        requestId,
        workingDirectory: currentAgent.workingDirectory,
      };

      const response = await fetch(getChatUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chatRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      createAbortHandler(requestId);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.trim()) {
            processStreamLine(line, streamingContext);
          }
        }
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      if (error.name !== "AbortError") {
        addMessage({
          type: "error",
          subtype: "stream_error",
          message: `Error: ${error.message}`,
          timestamp: Date.now(),
        });
      }
      resetRequestState();
    }
  }, [
    input,
    isLoading,
    activeAgentId,
    currentMode,
    currentSessionId,
    hasReceivedInit,
    currentAssistantMessage,
    generateRequestId,
    addMessage,
    clearInput,
    startRequest,
    setHasReceivedInit,
    setCurrentAssistantMessage,
    setCurrentSessionId,
    updateLastMessage,
    resetRequestState,
    processStreamLine,
    createAbortHandler,
    switchToAgent,
  ]);

  return (
    <div className="flex h-screen bg-[var(--claude-bg)]">
      {/* Sidebar */}
      <Sidebar
        activeAgentId={activeAgentId}
        agentSessions={agentSessions}
        onAgentSelect={handleAgentSwitch}
        onNewGroupChat={handleNewGroupChat}
        currentMode={currentMode}
        onModeChange={setCurrentMode}
      />

      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <ChatHeader
          currentMode={currentMode}
          activeAgentId={currentMode === "agent" ? activeAgentId : null}
          onModeToggle={handleModeToggle}
        />

        {/* Main Content Area */}
        {currentMode === "agent" && activeAgentId ? (
          /* Agent Detail View */
          <AgentDetailView
            agentId={activeAgentId}
            messages={messages}
            sessionId={currentSessionId}
          />
        ) : (
          /* Chat Interface */
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4">
              <div className="max-w-4xl mx-auto py-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-2xl">🤖</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Welcome to CodeByAgents
                      </h3>
                      <p className="text-gray-500">
                        {currentMode === "group" 
                          ? "Start a coding task or @mention agents to begin"
                          : activeAgentId 
                            ? `Assign tasks to ${getAgentById(activeAgentId)?.name}`
                            : "Select an agent from the sidebar to start coding"
                        }
                      </p>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      message.type === "chat" ? (
                        <MessageBubble
                          key={index}
                          message={message}
                          isLast={index === messages.length - 1}
                        />
                      ) : null
                    ))
                  )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Chat Input */}
            <ChatInput
              input={input}
              isLoading={isLoading}
              currentRequestId={currentRequestId}
              activeAgentId={activeAgentId}
              currentMode={currentMode}
              onInputChange={setInput}
              onSubmit={handleSendMessage}
              onAbort={handleAbort}
              onAgentSwitch={handleAgentSwitch}
            />
          </>
        )}
      </div>

      {/* Permission Dialog */}
      {permissionDialog && (
        <PermissionDialog
          {...permissionDialog}
          onAllow={() => closePermissionDialog()}
          onAllowPermanent={() => closePermissionDialog()}
          onDeny={() => closePermissionDialog()}
          onClose={closePermissionDialog}
        />
      )}
    </div>
  );
}