import { useState, useCallback, useEffect } from "react";
import type { ChatRequest, ChatMessage, ExecutionStep } from "../../types";
import { useTheme } from "../../hooks/useTheme";
import { useClaudeStreaming } from "../../hooks/useClaudeStreaming";
import { useChatState } from "../../hooks/chat/useChatState";
import { usePermissions } from "../../hooks/chat/usePermissions";
import { useAbortController } from "../../hooks/chat/useAbortController";
import { Sidebar } from "./Sidebar";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "../chat/ChatMessages"; 
import { ChatInput } from "./ChatInput";
import { AgentDetailView } from "./AgentDetailView";
import { PermissionDialog } from "../PermissionDialog";
import { getChatUrl } from "../../config/api";
import { KEYBOARD_SHORTCUTS } from "../../utils/constants";
import { useAgentConfig } from "../../hooks/useAgentConfig";
import type { StreamingContext } from "../../hooks/streaming/useMessageProcessor";

export function AgentHubPage() {
  const [currentMode, setCurrentMode] = useState<"group" | "agent">("group");
  
  useTheme(); // For theme switching support
  const { processStreamLine } = useClaudeStreaming();
  const { abortRequest, createAbortHandler } = useAbortController();
  const { getAgentById, getOrchestratorAgent, getWorkerAgents, config } = useAgentConfig();

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
    lastUsedAgentId,
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
    getTargetAgentId,
    getCurrentSession,
    getGroupChatContext,
  } = useChatState();

  const {
    permissionDialog,
    closePermissionDialog,
  } = usePermissions();


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
    
    const isGroupMode = currentMode === "group";
    let targetAgentId = activeAgentId;
    let messageContent = input.trim();
    let sessionToUse = currentSessionId;

    // In group mode, always route to Group Chat Agent for orchestration
    if (isGroupMode) {
      const orchestratorAgent = getOrchestratorAgent();
      if (orchestratorAgent) {
        targetAgentId = orchestratorAgent.id;
        // Keep the full message with @mentions for the orchestrator to analyze
        messageContent = input.trim();
        // Use group chat session instead of switching agent
        const groupContext = getGroupChatContext();
        sessionToUse = groupContext.sessionId;
      } else {
        // Fallback to old behavior if no orchestrator found
        const mentionMatch = input.match(/^@(\w+(?:-\w+)*)\s+(.*)$/);
        if (mentionMatch) {
          const [, agentId, cleanMessage] = mentionMatch;
          const agent = getAgentById(agentId);
          if (agent) {
            targetAgentId = agent.id;
            messageContent = cleanMessage;
            switchToAgent(agent.id);
          }
        } else {
          targetAgentId = getTargetAgentId();
          if (targetAgentId) {
            switchToAgent(targetAgentId);
          }
        }
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
    addMessage(userMessage, isGroupMode);

    clearInput();
    startRequest();

    // Set up streaming context
    const streamingContext: StreamingContext = {
      hasReceivedInit,
      currentAssistantMessage,
      setHasReceivedInit,
      setCurrentAssistantMessage,
      onSessionId: (sessionId) => setCurrentSessionId(sessionId, isGroupMode),
      addMessage: (msg) => addMessage(msg, isGroupMode),
      updateLastMessage: (content) => updateLastMessage(content, isGroupMode),
    };

    try {
      const currentAgent = getAgentById(targetAgentId);
      if (!currentAgent) return;

      const chatRequest: ChatRequest = {
        message: messageContent,
        sessionId: sessionToUse || undefined,
        requestId,
        workingDirectory: currentAgent.workingDirectory,
        availableAgents: config.agents.map(agent => ({
          id: agent.id,
          name: agent.name,
          description: agent.description,
          workingDirectory: agent.workingDirectory,
          apiEndpoint: agent.apiEndpoint,
          isOrchestrator: agent.isOrchestrator
        })),
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
        }, isGroupMode);
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
    getTargetAgentId,
  ]);

  // Handle execution of individual steps from orchestration plans
  const handleExecuteStep = useCallback(async (step: ExecutionStep) => {
    if (step.status !== "pending") return;

    const targetAgent = getAgentById(step.agent);
    if (!targetAgent) {
      console.error(`Agent not found: ${step.agent}`);
      return;
    }

    const isGroupMode = currentMode === "group";
    const requestId = generateRequestId();
    
    const userMessage: ChatMessage = {
      type: "chat",
      role: "user", 
      content: step.message,
      timestamp: Date.now(),
      agentId: step.agent,
    };

    // Use group chat context when in group mode
    addMessage(userMessage, isGroupMode);
    startRequest();

    const streamingContext: StreamingContext = {
      hasReceivedInit,
      currentAssistantMessage,
      setHasReceivedInit,
      setCurrentAssistantMessage,
      onSessionId: (sessionId) => setCurrentSessionId(sessionId, isGroupMode),
      addMessage: (msg) => addMessage(msg, isGroupMode),
      updateLastMessage: (content) => updateLastMessage(content, isGroupMode),
    };

    try {
      // For step execution, use the individual agent's session, not group chat session
      const agentSession = agentSessions[step.agent];
      const stepSessionId = agentSession?.sessionId || undefined;
      
      const chatRequest: ChatRequest = {
        message: step.message,
        sessionId: stepSessionId,
        requestId,
        workingDirectory: targetAgent.workingDirectory,
        availableAgents: config.agents.map(agent => ({
          id: agent.id,
          name: agent.name,
          description: agent.description,
          workingDirectory: agent.workingDirectory,
          apiEndpoint: agent.apiEndpoint,
          isOrchestrator: agent.isOrchestrator
        })),
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
      console.error("Step execution error:", error);
      if (error.name !== "AbortError") {
        addMessage({
          type: "error",
          subtype: "stream_error",
          message: `Error executing step: ${error.message}`,
          timestamp: Date.now(),
        });
      }
      resetRequestState();
    }
  }, [
    generateRequestId,
    addMessage,
    startRequest,
    hasReceivedInit,
    currentAssistantMessage,
    setHasReceivedInit,
    setCurrentAssistantMessage,
    setCurrentSessionId,
    updateLastMessage,
    currentSessionId,
    processStreamLine,
    createAbortHandler,
    resetRequestState,
  ]);

  // Handle automatic execution of entire orchestration plan
  const handleExecutePlan = useCallback(async (steps: ExecutionStep[]) => {
    console.log("Executing plan with", steps.length, "steps");
    
    // Execute steps respecting dependencies
    const executeStepsRecursively = async (remainingSteps: ExecutionStep[]) => {
      if (remainingSteps.length === 0) return;
      
      // Find steps that can be executed (no pending dependencies)
      const executableSteps = remainingSteps.filter(step => {
        if (step.status !== "pending") return false;
        
        // Check if all dependencies are completed
        const dependencies = step.dependencies || [];
        return dependencies.every(depId => {
          const depStep = steps.find(s => s.id === depId);
          return depStep?.status === "completed";
        });
      });
      
      if (executableSteps.length === 0) {
        console.log("No more executable steps found");
        return;
      }
      
      // Execute all executable steps in parallel
      console.log(`Executing ${executableSteps.length} steps:`, executableSteps.map(s => s.id));
      
      const promises = executableSteps.map(async (step) => {
        try {
          await handleExecuteStep(step);
          // Mark step as completed (in a real implementation, this would be done by the execution response)
          step.status = "completed";
        } catch (error) {
          console.error(`Failed to execute step ${step.id}:`, error);
          step.status = "failed";
        }
      });
      
      await Promise.all(promises);
      
      // Continue with remaining steps
      const stillPending = remainingSteps.filter(step => step.status === "pending");
      if (stillPending.length > 0) {
        // Small delay before next batch
        await new Promise(resolve => setTimeout(resolve, 1000));
        await executeStepsRecursively(stillPending);
      }
    };
    
    await executeStepsRecursively(steps);
    console.log("Plan execution completed");
  }, [handleExecuteStep]);

  return (
    <div className="layout-main">
      {/* Top Drag Bar for macOS */}
      <div 
        className="app-drag-region"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "28px",
          zIndex: 1000,
          backgroundColor: "transparent"
        }}
      />
      
      {/* Sidebar */}
      <Sidebar
        activeAgentId={activeAgentId}
        agentSessions={agentSessions}
        onAgentSelect={handleAgentSwitch}
        onNewGroupChat={handleNewGroupChat}
        currentMode={currentMode}
        onModeChange={setCurrentMode}
      />

      {/* Main Content */}
      <div className="layout-content">
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
            <div className="messages-container">
              <ChatMessages 
                messages={currentMode === "group" ? getGroupChatContext().messages : messages} 
                isLoading={isLoading} 
                onExecuteStep={handleExecuteStep}
                onExecutePlan={handleExecutePlan}
              />
            </div>

            {/* Chat Input */}
            <ChatInput
              input={input}
              isLoading={isLoading}
              currentRequestId={currentRequestId}
              activeAgentId={activeAgentId}
              currentMode={currentMode}
              lastUsedAgentId={lastUsedAgentId}
              onInputChange={setInput}
              onSubmit={handleSendMessage}
              onAbort={handleAbort}
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