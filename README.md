# ⚡ ChatGPT SmartAssist & ChatRecall AI Pro (v2.0)

> **The ultimate browser extension & web companion for ChatGPT.**  
> Supercharge your ChatGPT productivity with **in-chat precision search**, **memory recall**, **AI turn bookmarking**, **markdown/JSON exports**, and **zero-cloud privacy**.

---

## 🌟 Major Highlights & Features

### 🚀 Chrome Extension (Manifest V3 Ready)
- **Universal ChatGPT Support**: Works on both `https://chatgpt.com/*` and `https://chat.openai.com/*`.
- **In-Page Draggable Floating Widget**: Non-intrusive control panel embedded directly into ChatGPT pages.
- **Two-Pass Precision In-Chat Search**: Non-destructively highlights search terms across live prompt/response pairs with step-through (`Next` / `Prev`) match navigation.
- **60FPS Debounced DOM Observer**: Throttled mutation watching keeps CPU usage minimal during ChatGPT text streaming.
- **One-Click Turn Bookmarking**: Hover & capture ChatGPT prompts and responses directly to local storage memory.
- **Context Menu Integration**: Highlight any text on the web and right-click to `"📌 Save to SmartAssist Memory"` or `"🔍 Search in SmartAssist"`.
- **Background Service Worker**: Clean, persistent, manifest v3 event-driven architecture (`background.js`).

### 💻 Standalone Web Companion & Dashboard (`index.html`)
- **Glassmorphism Dark Theme**: Modern UI designed with responsive CSS variables.
- **Full-Text Search & Live Filtering**: Search by prompt, response code snippets, or tags in real-time.
- **Keyboard Accessibility**: `Escape` key closes modals, `Ctrl+F` / `Cmd+F` focuses search.
- **Bookmark & Category Filters**: Organize your chat history by Favorites, ChatGPT captures, or custom entries.
- **XSS Sanitized Rendering**: Secure text node rendering prevents DOM script injection.
- **JSON & Markdown Export**: Backup memories to standard JSON files or formatted Markdown notes for Notion/Obsidian.
- **JSON Backup Import**: Restore saved chat history across browsers and devices.

---


| File / Folder | Description |
| :--- | :--- |
| **📁 icons/** | Generated high-resolution icons (16px, 48px, 128px) |
| ├── icon16.png | 16px icon asset |
| ├── icon48.png | 48px icon asset |
| └── icon128.png | 128px icon asset |
| **📄 manifest.json** | Manifest V3 Extension configuration |
| **📄 background.js** | Background service worker (Storage & context menus) |
| **📄 content.js** | In-page ChatGPT floating widget & search highlighter |
| **📄 popup.html** | Extension popup UI |
| **📄 popup.js** | Extension popup logic & actions |
| **📄 index.html** | Standalone Web Companion Dashboard |
| **📄 app.js** | Standalone web app engine |
| **📄 style.css** | Unified master stylesheet |
| **📄 README.md** | Project documentation |



---

## 🚀 How to Install & Use

### Option 1: Load as Chrome Extension
1. Download or clone this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the repository folder.
5. Open [ChatGPT](https://chatgpt.com) — you will see the **⚡ SmartAssist** floating widget in the bottom-right corner!

### Option 2: Use Standalone Web Companion
1. Double-click `index.html` or host it via GitHub Pages.
2. Use it as a personal searchable knowledge base for your AI prompts, answers, and code snippets.
3. Use the **Load Demo** button to test sample data immediately.

---

## 🛡️ Privacy & Security First
- 🔒 **100% Local**: No external API calls, tracking scripts, or remote servers.
- 💾 **Storage Ownership**: Data stays entirely inside your browser (`chrome.storage.local` and `localStorage`).
- 🛡️ **XSS Protection**: All rendered text is sanitized prior to DOM insertion.

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!  
Feel free to open an issue or submit a pull request on [GitHub](https://github.com/Karthik8639-collab/Chatgpt--Smart-Assit).

---

## 📜 License
Licensed under the [MIT License](LICENSE).
