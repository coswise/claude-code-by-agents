import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { ProjectSelector } from "./components/ProjectSelector";
import { ChatPage } from "./components/ChatPage";
import { AgentHubPage } from "./components/native/AgentHubPage";
import { EnterBehaviorProvider } from "./contexts/EnterBehaviorContext";

function App() {
  return (
    <EnterBehaviorProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AgentHubPage />} />
          <Route path="/projects" element={<ProjectSelector />} />
          <Route path="/projects/*" element={<ChatPage />} />
        </Routes>
      </Router>
    </EnterBehaviorProvider>
  );
}

export default App;
