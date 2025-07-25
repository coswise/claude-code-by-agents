import { useEffect, useCallback } from "react";
import type { ChatRequest, ChatMessage } from "../types";
import { useTheme } from "../hooks/useTheme";
import { useClaudeStreaming } from "../hooks/useClaudeStreaming";
import { useChatState } from "../hooks/chat/useChatState";
import { usePermissions } from "../hooks/chat/usePermissions";
import { useAbortController } from "../hooks/chat/useAbortController";
import { ChatInput } from "./chat/ChatInput";
import { ChatMessages } from "./chat/ChatMessages";
import { AgentSelector } from "./chat/AgentSelector";
import { PermissionDialog } from "./PermissionDialog";
import { getChatUrl } from "../config/api";
import { KEYBOARD_SHORTCUTS } from "../utils/constants";
import { getAgentById } from "../config/agents";
import type { StreamingContext } from "../hooks/streaming/useMessageProcessor";

export function MultiAgentChatPage() {
  const { processStreamLine } = useClaudeStreaming();
  const { abortRequest, createAbortHandler } = useAbortController();

  const {
    messages,
    input,
    isLoading,
    currentSessionId,
    currentRequestId,
    hasShownInitMessage,
    hasReceivedInit,
    currentAssistantMessage,
    activeAgentId,
    agentSessions,
    setInput,
    setCurrentSessionId,
    setHasShownInitMessage,  
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

  const handleAbort = useCallback(() => {
    if (currentRequestId) {
      abortRequest(currentRequestId, isLoading, resetRequestState);
    }
  }, [currentRequestId, isLoading, abortRequest, resetRequestState]);

  // Handle keyboard shortcuts
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

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading || !activeAgentId) return;

    const currentAgent = getAgentById(activeAgentId);
    if (!currentAgent) return;

    const requestId = generateRequestId();
    
    // Add user message with agent ID
    const userMessage: ChatMessage = {
      type: "chat",
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
      agentId: activeAgentId,
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
      const chatRequest: ChatRequest = {
        message: input.trim(),
        sessionId: currentSessionId || undefined,
        requestId,
        workingDirectory: activeAgentId ? getAgentById(activeAgentId)?.workingDirectory : undefined,
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

      // Set up abort handler
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
        // Handle non-abort errors
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
    currentSessionId,
    hasReceivedInit,
    currentAssistantMessage,
    hasShownInitMessage,
    generateRequestId,
    addMessage,
    clearInput,
    startRequest,
    setHasReceivedInit,
    setCurrentAssistantMessage,
    setHasShownInitMessage,
    setCurrentSessionId,
    updateLastMessage,
    resetRequestState,
    processStreamLine,
    createAbortHandler,
  ]);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-card-foreground">
              Multi-Agent Chat
            </h1>
          </div>
          <div className="flex items-center gap-2">
          </div>
        </div>
      </div>

      {/* Agent Selector */}
      <AgentSelector
        activeAgentId={activeAgentId}
        onAgentSelect={handleAgentSwitch}
        agentSessions={agentSessions}
      />

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
        />
      </div>

      {/* Chat Input */}
      <div className="border-t border-border bg-card p-4">
        <ChatInput
          input={input}
          isLoading={isLoading}
          currentRequestId={currentRequestId}
          activeAgentId={activeAgentId}
          onInputChange={setInput}
          onSubmit={handleSendMessage}
          onAbort={handleAbort}
          onAgentSwitch={handleAgentSwitch}
        />
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