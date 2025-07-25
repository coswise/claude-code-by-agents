# Claude Code Web Agent

A multi-agent orchestration platform built on top of Claude Code CLI. This project enables intelligent coordination between specialized agents through a web interface with file-based communication.

> **Forked from [sugyan/claude-code-webui](https://github.com/sugyan/claude-code-webui)** - Thank you for the excellent foundation!

## What This Does

Transform single-agent coding into intelligent multi-agent workflows:

**Traditional Approach:**
- One agent handles everything
- Manual task coordination  
- Context switching between projects

**Multi-Agent Orchestration:**
- Specialized agents for different projects
- Intelligent task decomposition
- File-based result sharing between agents

## Quick Start

### Prerequisites
- Claude CLI installed and authenticated
- Node.js >=20.0.0 or Deno
- dotenvx for development

### Run Development Mode

```bash
# Backend
cd backend && deno task dev

# Frontend (new terminal)  
cd frontend && npm run dev

# Open http://localhost:3000
```

## How It Works

### 1. Agent Orchestration
When you send a request, the orchestrator:
- Breaks down complex tasks into steps
- Assigns each step to the right specialist agent
- Creates file-based communication between agents

### 2. File-Based Coordination
Each agent:
- Saves results to plain text files (e.g., `/tmp/step1_results.txt`)
- Reads from files created by previous agents
- Follows dependency chains for proper execution order

### 3. Example Workflow

**User Request:** "Create authentication system"

**Orchestrator Plan:**
```json
{
  "steps": [
    {
      "id": "step1",
      "agent": "readymojo-api", 
      "message": "Analyze auth requirements and save to /tmp/auth_analysis.txt",
      "output_file": "/tmp/auth_analysis.txt"
    },
    {
      "id": "step2",
      "agent": "readymojo-api",
      "message": "Read /tmp/auth_analysis.txt and implement backend. Save to /tmp/backend_impl.txt",
      "output_file": "/tmp/backend_impl.txt",
      "dependencies": ["step1"]
    },
    {
      "id": "step3",
      "agent": "readymojo-web",
      "message": "Read /tmp/backend_impl.txt and create frontend components. Save to /tmp/frontend_work.txt",
      "output_file": "/tmp/frontend_work.txt", 
      "dependencies": ["step2"]
    }
  ]
}
```

## Available Agents

- **readymojo-admin**: Admin dashboard and management
- **readymojo-api**: Backend API and server logic  
- **readymojo-web**: Frontend web application
- **peakmojo-kit**: UI component library

## Key Features

- **Smart Task Decomposition**: Automatically breaks complex requests into manageable steps
- **Specialist Routing**: Each agent focuses on their domain expertise
- **File-Based Communication**: Persistent results enable complex workflows
- **Dependency Management**: Ensures proper execution order
- **Web Interface**: Modern chat UI for natural interaction

## Architecture

```
User Request → Orchestrator → Step Plans → Agent Execution → File Results → Next Agent
```

The orchestrator acts as an intelligent coordinator that:
1. Analyzes user requests
2. Creates structured execution plans  
3. Routes tasks to specialized agents
4. Manages file-based communication
5. Coordinates dependencies

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

## Credits

**Original Project**: [sugyan/claude-code-webui](https://github.com/sugyan/claude-code-webui)

This fork extends the original web interface concept with multi-agent orchestration capabilities. The foundational web UI, streaming architecture, and Claude CLI integration come from the excellent work by sugyan.

## License

MIT License - see [LICENSE](LICENSE) for details.