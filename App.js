/**
 * ChatRecall AI Pro - Standalone Companion App Engine
 * High-performance local storage manager with full-text search, tagging, keyboard shortcuts, & exports.
 */

(function () {
  let memories = [];
  let currentFilter = "all";
  let activeSearchQuery = "";

  document.addEventListener("DOMContentLoaded", () => {
    initApp();
  });

  function initApp() {
    loadMemoriesFromStorage();
    attachEventListeners();
    attachGlobalKeyboardShortcuts();
  }

  /**
   * Universal Storage Loader (Extension Storage API + LocalStorage fallback)
   */
  function loadMemoriesFromStorage() {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(["chatRecall"], (result) => {
        memories = result.chatRecall || [];
        renderAll();
      });
    } else {
      const localData = localStorage.getItem("chatRecall");
      memories = localData ? JSON.parse(localData) : [];
      renderAll();
    }
  }

  function saveMemoriesToStorage() {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ chatRecall: memories });
    }
    localStorage.setItem("chatRecall", JSON.stringify(memories));
    renderAll();
  }

  /**
   * UI Event Bindings
   */
  function attachEventListeners() {
    // Search input
    const searchBar = document.getElementById("searchBar");
    const clearBtn = document.getElementById("btn-clear-search");

    searchBar.addEventListener("input", (e) => {
      activeSearchQuery = e.target.value.toLowerCase();
      clearBtn.style.display = activeSearchQuery ? "inline-block" : "none";
      renderGrid();
    });

    clearBtn.addEventListener("click", () => {
      searchBar.value = "";
      activeSearchQuery = "";
      clearBtn.style.display = "none";
      renderGrid();
    });

    // Navigation Items
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.getAttribute("data-view");
        renderGrid();
      });
    });

    // Clear All
    document.getElementById("btnClearAll").addEventListener("click", () => {
      if (confirm("Are you sure you want to delete all saved memories? This action cannot be undone.")) {
        memories = [];
        saveMemoriesToStorage();
      }
    });

    // Load Demo Data
    document.getElementById("btn-load-demo").addEventListener("click", () => {
      loadSampleDemoData();
    });

    // Modals
    const addModal = document.getElementById("modal-add");
    document.getElementById("btn-open-add-modal").addEventListener("click", () => {
      addModal.style.display = "flex";
      document.getElementById("input-title").focus();
    });

    document.getElementById("modal-add-close").addEventListener("click", () => {
      addModal.style.display = "none";
    });

    document.getElementById("btn-save-new-memory").addEventListener("click", () => {
      const title = document.getElementById("input-title").value.trim() || "Untitled Memory";
      const text = document.getElementById("input-text").value.trim();
      const tagsInput = document.getElementById("input-tags").value.trim();
      const tags = tagsInput ? tagsInput.split(",").map((t) => t.trim()) : ["custom"];

      if (!text) {
        alert("Please enter memory content!");
        return;
      }

      const newMsg = {
        id: Date.now().toString(),
        title,
        text,
        time: new Date().toLocaleString(),
        source: "Manual Entry",
        tags,
        isFavorite: false
      };

      memories.unshift(newMsg);
      saveMemoriesToStorage();

      // Reset modal
      document.getElementById("input-title").value = "";
      document.getElementById("input-text").value = "";
      document.getElementById("input-tags").value = "";
      addModal.style.display = "none";
    });

    // View Modal
    const viewModal = document.getElementById("modal-view");
    document.getElementById("modal-view-close").addEventListener("click", () => {
      viewModal.style.display = "none";
    });

    document.getElementById("btn-copy-view").addEventListener("click", () => {
      const text = document.getElementById("view-text-content").textContent;
      navigator.clipboard.writeText(text);
      alert("Copied text to clipboard!");
    });

    // Dropdown Export
    const exportBtn = document.getElementById("btn-export-dropdown");
    const exportMenu = document.getElementById("export-menu");
    exportBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      exportMenu.style.display = exportMenu.style.display === "none" ? "block" : "none";
    });

    document.addEventListener("click", () => {
      exportMenu.style.display = "none";
    });

    document.getElementById("export-json").addEventListener("click", () => exportJSON());
    document.getElementById("export-md").addEventListener("click", () => exportMarkdown());

    // Import JSON
    const importBtn = document.getElementById("btn-import-file");
    const fileInput = document.getElementById("file-input-json");
    importBtn.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) {
            // Deduplicate
            const existingIds = new Set(memories.map((m) => m.id));
            const newItems = imported.filter((item) => !existingIds.has(item.id));
            memories = [...newItems, ...memories];
            saveMemoriesToStorage();
            alert(`Successfully imported ${newItems.length} new items!`);
          } else {
            alert("Invalid JSON format. Expected an array of memory objects.");
          }
        } catch (err) {
          alert("Error parsing JSON file: " + err.message);
        }
      };
      reader.readAsText(file);
    });
  }

  /**
   * Keyboard Shortcuts (ESC closes modals, Ctrl/Cmd + F focuses search)
   */
  function attachGlobalKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.getElementById("modal-add").style.display = "none";
        document.getElementById("modal-view").style.display = "none";
        document.getElementById("export-menu").style.display = "none";
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        const activeTag = document.activeElement ? document.activeElement.tagName : "";
        if (activeTag !== "INPUT" && activeTag !== "TEXTAREA") {
          e.preventDefault();
          document.getElementById("searchBar").focus();
        }
      }
    });
  }

  /**
   * Main Render Pipeline
   */
  function renderAll() {
    updateStats();
    renderGrid();
  }

  function updateStats() {
    document.getElementById("count-all").textContent = memories.length;
    document.getElementById("count-fav").textContent = memories.filter((m) => m.isFavorite).length;
    document.getElementById("count-gpt").textContent = memories.filter((m) => m.source && m.source.includes("chatgpt")).length;

    document.getElementById("stat-total").textContent = memories.length;

    const todayStr = new Date().toLocaleDateString();
    const todayCount = memories.filter((m) => m.time && m.time.includes(todayStr)).length;
    document.getElementById("stat-today").textContent = todayCount;

    const jsonStr = JSON.stringify(memories);
    const kb = (new Blob([jsonStr]).size / 1024).toFixed(1);
    document.getElementById("stat-storage").textContent = `${kb} KB`;
  }

  function renderGrid() {
    const container = document.getElementById("messagesContainer");
    container.innerHTML = "";

    let filtered = memories;

    // View Filter
    if (currentFilter === "favorites") {
      filtered = filtered.filter((m) => m.isFavorite);
    } else if (currentFilter === "chatgpt") {
      filtered = filtered.filter((m) => (m.source && m.source.includes("chatgpt")) || (m.tags && m.tags.includes("chatgpt-turn")));
    }

    // Search Filter
    if (activeSearchQuery) {
      filtered = filtered.filter((m) => {
        const textMatch = m.text && m.text.toLowerCase().includes(activeSearchQuery);
        const titleMatch = m.title && m.title.toLowerCase().includes(activeSearchQuery);
        const tagMatch = m.tags && m.tags.some((t) => t.toLowerCase().includes(activeSearchQuery));
        return textMatch || titleMatch || tagMatch;
      });
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state-large">
          <span class="empty-icon">📂</span>
          <h3>No memories match your query</h3>
          <p>Try searching for another keyword or click "+ New Memory" to add one.</p>
        </div>
      `;
      return;
    }

    filtered.forEach((msg) => {
      const card = document.createElement("div");
      card.className = "card";

      const titleText = escapeHtml(msg.title || "Saved Memory");
      const snippetText = escapeHtml(msg.text.length > 200 ? msg.text.substring(0, 200) + "..." : msg.text);
      const timeText = escapeHtml(msg.time || "N/A");
      const favClass = msg.isFavorite ? "fav-active" : "";

      const tagsHtml = (msg.tags || ["note"])
        .map((t) => `<span class="tag">#${escapeHtml(t)}</span>`)
        .join(" ");

      card.innerHTML = `
        <div class="card-header">
          <h4 class="card-title">${highlightText(titleText, activeSearchQuery)}</h4>
          <button class="star-btn ${favClass}" data-id="${msg.id}">${msg.isFavorite ? "★" : "☆"}</button>
        </div>
        <div class="card-meta">
          <span>🕒 ${timeText}</span>
        </div>
        <p class="card-snippet">${highlightText(snippetText, activeSearchQuery)}</p>
        <div class="card-tags">${tagsHtml}</div>
        <div class="card-actions">
          <button class="btn small outline view-btn" data-id="${msg.id}">👁️ View</button>
          <button class="btn small outline copy-btn" data-text="${escapeHtmlAttribute(msg.text)}">📋 Copy</button>
          <button class="btn small danger delete-btn" data-id="${msg.id}">🗑️ Delete</button>
        </div>
      `;

      // Card Events
      card.querySelector(".star-btn").addEventListener("click", () => toggleFavorite(msg.id));
      card.querySelector(".view-btn").addEventListener("click", () => openViewModal(msg));
      card.querySelector(".copy-btn").addEventListener("click", (e) => {
        navigator.clipboard.writeText(msg.text);
        e.target.textContent = "✓ Copied";
        setTimeout(() => (e.target.textContent = "📋 Copy"), 1500);
      });
      card.querySelector(".delete-btn").addEventListener("click", () => deleteMemory(msg.id));

      container.appendChild(card);
    });
  }

  function toggleFavorite(id) {
    const item = memories.find((m) => m.id === id);
    if (item) {
      item.isFavorite = !item.isFavorite;
      saveMemoriesToStorage();
    }
  }

  function deleteMemory(id) {
    if (confirm("Delete this memory item?")) {
      memories = memories.filter((m) => m.id !== id);
      saveMemoriesToStorage();
    }
  }

  function openViewModal(msg) {
    document.getElementById("view-title").textContent = msg.title || "Memory Detail";
    document.getElementById("view-time").textContent = msg.time || "";
    document.getElementById("view-source").textContent = msg.source || "Local";
    document.getElementById("view-text-content").textContent = msg.text;

    document.getElementById("modal-view").style.display = "flex";
  }

  function loadSampleDemoData() {
    const demoItems = [
      {
        id: "demo-1",
        title: "Python Async / Await Event Loop Pattern",
        text: "Prompt: Explain async asyncio tasks in Python 3.12.\n\nResponse: Use `asyncio.TaskGroup()` for safe structured concurrency instead of `asyncio.gather()` when executing parallel coroutines.",
        time: new Date().toLocaleString(),
        source: "https://chatgpt.com",
        tags: ["python", "asyncio", "chatgpt-turn"],
        isFavorite: true
      },
      {
        id: "demo-2",
        title: "Chrome Extension MV3 Background Messaging",
        text: "Prompt: How to send background messages in Chrome Extension Manifest V3?\n\nResponse: Use `chrome.runtime.sendMessage({ action: 'SAVE' }, response => ...)` and in background.js set `chrome.runtime.onMessage.addListener(...)` returning `true` for async callbacks.",
        time: new Date().toLocaleString(),
        source: "https://chatgpt.com",
        tags: ["javascript", "chrome-extension", "chatgpt-turn"],
        isFavorite: false
      }
    ];

    // Add only items that don't exist
    const existingIds = new Set(memories.map((m) => m.id));
    const newDemos = demoItems.filter((d) => !existingIds.has(d.id));

    if (newDemos.length > 0) {
      memories = [...newDemos, ...memories];
      saveMemoriesToStorage();
      alert("Sample demo data loaded!");
    } else {
      alert("Demo data is already loaded in your memory.");
    }
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(memories, null, 2)], { type: "application/json" });
    downloadBlob(blob, "chatrecall-backup.json");
  }

  function exportMarkdown() {
    let md = `# 🤖 ChatRecall AI - Saved Memory Collection\n\n_Exported on ${new Date().toLocaleString()}_\n\n---\n\n`;
    memories.forEach((item, i) => {
      md += `## ${i + 1}. ${item.title || "Saved Memory"}\n`;
      md += `* **Timestamp:** ${item.time}\n`;
      md += `* **Source:** ${item.source || "N/A"}\n`;
      md += `* **Tags:** ${item.tags ? item.tags.join(", ") : "none"}\n\n`;
      md += "```\n" + item.text + "\n```\n\n---\n\n";
    });
    const blob = new Blob([md], { type: "text/markdown" });
    downloadBlob(blob, "chatrecall-export.md");
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function escapeHtmlAttribute(str) {
    if (!str) return "";
    return str.replace(/"/g, "&quot;");
  }

  function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.replace(regex, '<mark class="highlight">$1</mark>');
  }
})();
