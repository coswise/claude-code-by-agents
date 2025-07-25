import { X } from "lucide-react";
import { ThemeToggle } from "./chat/ThemeToggle";
import { useTheme } from "../hooks/useTheme";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, toggleTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: "var(--claude-message-bg)",
          border: "1px solid var(--claude-border)",
          borderRadius: "12px",
          padding: "24px",
          width: "400px",
          maxWidth: "90vw",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "var(--claude-shadow)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px"
          }}
        >
          <h2 
            style={{
              fontSize: "18px",
              fontWeight: 600,
              margin: 0,
              color: "var(--claude-text-primary)"
            }}
          >
            Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: "8px",
              borderRadius: "6px",
              background: "none",
              border: "none",
              color: "var(--claude-text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--claude-sidebar-hover)";
              e.currentTarget.style.color = "var(--claude-text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "var(--claude-text-muted)";
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Theme Setting */}
        <div style={{ marginBottom: "20px" }}>
          <div 
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0"
            }}
          >
            <div>
              <h3 
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  margin: "0 0 4px 0",
                  color: "var(--claude-text-primary)"
                }}
              >
                Theme
              </h3>
              <p 
                style={{
                  fontSize: "12px",
                  color: "var(--claude-text-muted)",
                  margin: 0
                }}
              >
                Choose between light and dark mode
              </p>
            </div>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>

        {/* Additional settings can be added here */}
        <div 
          style={{
            borderTop: "1px solid var(--claude-border)",
            paddingTop: "16px",
            textAlign: "center"
          }}
        >
          <p 
            style={{
              fontSize: "11px",
              color: "var(--claude-text-muted)",
              margin: 0
            }}
          >
            More settings coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}