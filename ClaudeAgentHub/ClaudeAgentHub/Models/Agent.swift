import Foundation

struct Agent: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let description: String
    let workingDirectory: String
    let apiEndpoint: String
    let isOrchestrator: Bool
    let isEnabled: Bool
    
    init(id: String, name: String, description: String, workingDirectory: String, apiEndpoint: String, isOrchestrator: Bool = false, isEnabled: Bool = true) {
        self.id = id
        self.name = name
        self.description = description
        self.workingDirectory = workingDirectory
        self.apiEndpoint = apiEndpoint
        self.isOrchestrator = isOrchestrator
        self.isEnabled = isEnabled
    }
    
    static let sampleAgents: [Agent] = [
        Agent(
            id: "group-chat-agent",
            name: "Group Chat Agent",
            description: "Orchestrates multi-agent conversations",
            workingDirectory: "/Users/user/projects",
            apiEndpoint: "http://localhost:8080",
            isOrchestrator: true
        ),
        Agent(
            id: "api-agent",
            name: "API Backend Agent",
            description: "Handles backend API development",
            workingDirectory: "/Users/user/projects/backend",
            apiEndpoint: "http://localhost:8081"
        ),
        Agent(
            id: "frontend-agent",
            name: "Frontend Agent",
            description: "Handles React frontend development",
            workingDirectory: "/Users/user/projects/frontend",
            apiEndpoint: "http://localhost:8082"
        )
    ]
}

struct AgentSession {
    let agentId: String
    var sessionId: String?
    var messages: [ChatMessage]
    var lastActiveTime: Date
    
    init(agentId: String) {
        self.agentId = agentId
        self.sessionId = nil
        self.messages = []
        self.lastActiveTime = Date()
    }
}

extension Agent {
    var displayName: String {
        return isOrchestrator ? "🎭 \(name)" : name
    }
    
    var statusColor: String {
        return isEnabled ? (isOrchestrator ? "purple" : "blue") : "gray"
    }
}