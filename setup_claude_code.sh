#!/bin/bash

# ========== CONFIG ==========
APP_NAME="Claude Code"
APP_DIR="$HOME/Applications"
PROJECT_DIR="$HOME/Documents/Essential/claude-code-by-agents-main"
LAUNCHER_PATH="$APP_DIR/$APP_NAME.command"
NODE_VERSION_REQUIRED="18"

# ========== UTILS ==========

function print_step() {
  echo ""
  echo "🔧 $1"
}

function ensure_dir() {
  [ ! -d "$1" ] && mkdir -p "$1"
}

# ========== SETUP ==========

print_step "Installing dependencies..."
brew install deno make node claude || true

print_step "Ensuring node version >= $NODE_VERSION_REQUIRED..."
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt "$NODE_VERSION_REQUIRED" ]; then
  echo "❌ Node.js version must be >= $NODE_VERSION_REQUIRED"
  exit 1
fi

print_step "Installing project dependencies..."
cd "$PROJECT_DIR" || { echo "❌ Project not found at $PROJECT_DIR"; exit 1; }
make install

print_step "Running Electron app in background to verify..."
make electron &

print_step "Creating launcher in $APP_DIR..."
ensure_dir "$APP_DIR"

cat <<EOF > "$LAUNCHER_PATH"
#!/bin/bash
cd "$PROJECT_DIR"
make electron
EOF

chmod +x "$LAUNCHER_PATH"

print_step "Creating .app bundle for Applications folder..."
APP_BUNDLE="$APP_DIR/$APP_NAME.app"
APP_SCRIPT="$APP_DIR/$APP_NAME.AppleScript"

cat <<EOF > "$APP_SCRIPT"
tell application "Terminal"
  do script "cd \"$PROJECT_DIR\" && make electron"
end tell
EOF

osacompile -o "$APP_BUNDLE" "$APP_SCRIPT"
rm "$APP_SCRIPT"

print_step "✅ Setup complete!"
echo "→ Launch '$APP_NAME' from your Applications folder or run:"
echo "\"$LAUNCHER_PATH\""
