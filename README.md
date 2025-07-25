# Code By Agents

A dynamic multi-agent orchestration platform that enables intelligent coordination between specialized AI agents through a modern web interface. Each agent runs independently with its own API endpoint and can be dynamically configured through the settings interface.

<img width="1304" height="811" alt="Screenshot 2025-07-25 at 10 00 57 AM" src="https://github.com/user-attachments/assets/99c6095c-8c1d-4a69-a240-2a974e01c097" />


> **Forked from [sugyan/claude-code-webui](https://github.com/sugyan/claude-code-webui)** - Thank you for the excellent foundation!

## What This Does

Transform single-agent AI interactions into intelligent multi-agent workflows with dynamic configuration:

**Traditional Approach:**
- One AI agent handles everything
- Manual task coordination  
- Static, hardcoded agent configurations

**Dynamic Multi-Agent Orchestration:**
- Configurable agents for different projects/domains
- Intelligent routing: single @mentions vs multi-agent orchestration
- HTTP-based communication between distributed agent instances
- Real-time agent management through settings interface

## Quick Start

### Prerequisites
- Claude CLI installed and authenticated on each agent machine
- Node.js >=20.0.0 or Deno
- dotenvx for development

### Run Development Mode

```bash
# Main orchestrator backend
cd backend && deno task dev        # Runs on http://localhost:8080

# Frontend (new terminal)  
cd frontend && npm run dev         # Runs on http://localhost:3000

# Agent instances (additional terminals)
# Each agent runs its own Claude Code Web Agent instance
cd path/to/agent1 && deno task dev   # e.g., http://localhost:8081
cd path/to/agent2 && deno task dev   # e.g., http://localhost:8082

# Open http://localhost:3000 and configure agents in Settings
```

### Agent Configuration

1. Open **Settings** in the web interface
2. Add agents with their respective:
   - **Name**: Human-readable agent name
   - **Description**: What the agent specializes in
   - **Working Directory**: Local path to agent's project
   - **API Endpoint**: HTTP endpoint where agent instance runs
3. The first agent automatically becomes the orchestrator

## How It Works

### 1. Smart Routing System
The system intelligently routes requests based on content:

**Single Agent Mentions**: `@agent-name do something`
- Direct HTTP request to agent's API endpoint
- No orchestration overhead - immediate execution
- Agent works in its configured environment

**Multi-Agent Requests**: `@agent1 and @agent2 collaborate`
- Orchestrator creates step-by-step execution plan
- File-based communication between agents
- Dependency management ensures proper execution order

**General Requests**: `"Build a feature"`
- Orchestrator analyzes and decomposes the task
- Assigns work to best-suited agents
- Coordinates complex multi-step workflows

### 2. HTTP-Based Agent Communication
- Each agent runs as independent Claude Code instance
- Main orchestrator communicates via HTTP API calls
- Maintains session continuity across agent boundaries
- Real-time streaming responses for immediate feedback

### 3. Dynamic Agent Management
- Add/remove agents through web interface
- Configure working directories and API endpoints
- Automatic orchestrator assignment (first agent)
- Live updates to routing and orchestration logic

### 4. Example Workflows

**Single Agent Request**: `@api-agent add user authentication`
```
User → Orchestrator → HTTP POST to api-agent's endpoint → Direct execution
```

**Multi-Agent Request**: `"Create full authentication system"`
```json
{
  "steps": [
    {
      "id": "step1",
      "agent": "api-agent", 
      "message": "Analyze auth requirements and implement backend API",
      "output_file": "/tmp/auth_backend.txt"
    },
    {
      "id": "step2", 
      "agent": "web-agent",
      "message": "Read /tmp/auth_backend.txt and create frontend components",
      "output_file": "/tmp/auth_frontend.txt",
      "dependencies": ["step1"]
    },
    {
      "id": "step3",
      "agent": "admin-agent", 
      "message": "Read /tmp/auth_frontend.txt and update admin dashboard",
      "dependencies": ["step2"]
    }
  ]
}
```

## Dynamic Agent Configuration

Agents are now **fully configurable** through the web interface! No hardcoded limitations.

### Default Example Agents
- **Chat with Agents**: Orchestrator for multi-agent coordination
- **ReadyMojo Admin**: Admin dashboard and management interface
- **ReadyMojo API**: Backend API and server logic  
- **ReadyMojo Web**: Frontend web application
- **PeakMojo LiveKit**: LiveKit voice integration

### Custom Agent Setup
Add your own agents by providing:
- **Unique ID**: URL-safe identifier (e.g., `my-custom-agent`)
- **Name**: Display name (e.g., `My Custom Agent`)
- **Description**: What the agent specializes in
- **Working Directory**: Path to agent's project files
- **API Endpoint**: HTTP endpoint where agent runs (e.g., `http://localhost:8085`)

All agents appear immediately in:
- Settings management interface
- @mention autocomplete
- Orchestration routing logic
- Sidebar navigation

## Key Features

### 🎯 **Intelligent Routing**
- **Single @mentions**: Direct HTTP execution (no orchestration overhead)
- **Multi-agent requests**: Automatic task decomposition with file-based coordination
- **Context-aware**: Routes based on agent specializations and dependencies

### ⚙️ **Dynamic Configuration**
- **Real-time agent management**: Add/edit/remove agents through web UI
- **Flexible deployment**: Each agent runs independently with own API endpoint
- **Automatic integration**: New agents immediately available in all features

### 🔗 **HTTP-Based Communication**
- **Distributed architecture**: Agents can run on different machines/ports
- **Session continuity**: Maintains conversation context across agent boundaries
- **Streaming responses**: Real-time feedback from all agent interactions

### 🎨 **Modern Web Interface**
- **Chat-based interaction**: Natural language requests with @mention support
- **Agent management**: Visual configuration and monitoring
- **Theme support**: Light/dark modes with orange-based design
- **Responsive design**: Works on desktop and mobile devices

## Architecture

### System Overview
```
Frontend (React) ←→ Main Backend (Orchestrator) ←→ Agent Instance 1 (Port 8081)
                                                  ←→ Agent Instance 2 (Port 8082)  
                                                  ←→ Agent Instance N (Port 808X)
```

### Request Flow

**Single Agent**: `@agent-name request`
```
User → Frontend → Main Backend → HTTP Request → Agent's Claude Instance → Response
```

**Multi-Agent**: `"Complex request requiring multiple agents"`  
```  
User → Frontend → Main Backend → Orchestrator Analysis → Step Plans
                                                        ↓
Agent 1 ← HTTP Request ← Step 1 ← File Dependencies ← Coordination
Agent 2 ← HTTP Request ← Step 2 ← Read Step 1 Output ← Logic
Agent N ← HTTP Request ← Step N ← Read Previous Results
```

### Key Components
- **Main Backend**: Orchestrator + routing logic + web server
- **Agent Instances**: Independent Claude Code processes with HTTP APIs
- **Settings System**: Dynamic agent configuration with localStorage persistence
- **File Coordination**: Plain text files enable complex multi-step workflows

## Development

### Quality Checks
```bash
make check      # Format, lint, typecheck, test
make format     # Format code
make lint       # Lint code  
make test       # Run tests
```

### Building
```bash
make build-backend   # Build binary
make build-frontend  # Build frontend assets
```

## Contributing

We welcome contributions! This project uses:
- **Lefthook**: Pre-commit hooks ensure code quality
- **Make**: Unified commands for development tasks
- **TypeScript**: Full type safety across frontend and backend
- **Dynamic Configuration**: No hardcoded agents - all configurable through UI
- **HTTP APIs**: RESTful communication between orchestrator and agents

## Credits

**Original Project**: [sugyan/claude-code-webui](https://github.com/sugyan/claude-code-webui)

This fork dramatically extends the original web interface concept with:
- **Multi-agent orchestration**: Intelligent coordination between specialized agents
- **Dynamic configuration**: Runtime agent management through web interface  
- **HTTP-based communication**: Distributed agent architecture
- **Smart routing**: Single @mentions vs multi-agent workflow detection
- **Modern UI**: Enhanced chat interface with agent management

The foundational web UI, streaming architecture, and Claude CLI integration come from the excellent work by sugyan.

## License

MIT License - see [LICENSE](LICENSE) for details.
