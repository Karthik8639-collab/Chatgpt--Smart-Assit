# ⚡ OmniAssist AI - Universal Chat Recall & Productivity Suite (v3.0)

> **The ultimate browser extension & web companion for Google Gemini, ChatGPT, Claude, Perplexity, DeepSeek, Poe, and any AI platform.**  
> Supercharge your AI workflow with **universal in-page search**, **cross-platform memory recall**, **AI turn bookmarking**, **markdown/JSON exports**, and **zero-cloud privacy**.

---

## 🌟 Supported AI Platforms & Features

### 🤖 Universal AI Platform Support
- **✨ Google Gemini** (`gemini.google.com`)
- **🟢 OpenAI ChatGPT** (`chatgpt.com` & `chat.openai.com`)
- **🟧 Anthropic Claude** (`claude.ai`)
- **🔍 Perplexity AI** (`perplexity.ai`)
- **🐋 DeepSeek** (`chat.deepseek.com`)
- **⚡ Poe by Quora** (`poe.com`)
- **🌀 Mistral Le Chat** (`chat.mistral.ai`)
- **🌐 Any Web Page or AI Platform** (`<all_urls>`)

---

## 🚀 Key Extension Capabilities (Manifest V3)

- **Draggable In-Page Control Panel**: Floating widget with auto-detected AI provider badge (`Gemini`, `ChatGPT`, `Claude`, etc.).
- **Two-Pass Precision Highlighter**: Non-destructively highlights search terms across active AI prompt & answer turns with step-through (`Next ▲` / `Prev ▼`) match navigation.
- **60FPS Debounced DOM Observer**: Throttled mutation watching maintains smooth 60fps performance during live streaming AI output.
- **Universal Turn Capture**: Hover & bookmark conversation turns across any AI platform.
- **Right-Click Context Menus**: Highlight text anywhere to `"📌 Save to OmniAssist Memory"` or `"🔍 Search in OmniAssist"`.
- **Keyboard Shortcuts**: `Escape` key closes modals, `Ctrl+F` / `Cmd+F` focuses search bar.

---

## 💻 Standalone Web Companion & Dashboard (`index.html`)

- **Multi-Provider Filter Sidebar**: Filter saved memories by **Gemini**, **ChatGPT**, **Claude**, **Bookmarks**, or **All**.
- **Glassmorphic Dark UI**: Built with responsive CSS design variables.
- **XSS-Sanitized Rendering**: Secure text node parsing prevents script injection.
- **JSON & Markdown Export**: Backup memories to standard JSON or formatted Markdown files for Notion/Obsidian.
- **JSON Backup Import**: Restore saved AI conversations across devices.

---

## 📁 Repository Structure

| File / Folder | Description |
| :--- | :--- |
| **📁 icons/** | Generated high-resolution icons (16px, 48px, 128px) |
| ├── icon16.png | 16px icon asset |
| ├── icon48.png | 48px icon asset |
| └── icon128.png | 128px icon asset |
| **📄 manifest.json** | Manifest V3 Universal Extension configuration |
| **📄 background.js** | Background service worker (Storage & context menus) |
| **📄 content.js** | In-page universal floating widget & search highlighter |
| **📄 popup.html** | Extension popup UI |
| **📄 popup.js** | Extension popup logic & actions |
| **📄 index.html** | Standalone Web Companion Dashboard |
| **📄 app.js** | Standalone web app engine |
| **📄 style.css** | Unified master stylesheet with AI brand theme badges |
| **📄 README.md** | Project documentation |

---

## 🚀 Installation & Setup

### Option 1: Load as Chrome Extension
1. Download or clone this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the repository folder.
5. Open [Gemini](https://gemini.google.com), [ChatGPT](https://chatgpt.com), or [Claude](https://claude.ai) — the **⚡ OmniAssist** widget will appear automatically!

### Option 2: Standalone Web Companion
1. Open `index.html` in your browser.
2. Click **Load Demo** to experience sample multi-provider AI items immediately.

---

## 🛡️ Privacy Statement
- 🔒 **100% Local & Private**: No external API calls, tracking scripts, or remote cloud servers.
- 💾 **Local Storage**: All data is stored in `chrome.storage.local` and `localStorage`.

---

## 📜 License
Licensed under the [MIT License](LICENSE).
