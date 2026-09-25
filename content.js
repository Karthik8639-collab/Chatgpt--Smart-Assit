/**
 * ChatGPT SmartAssist - Content Script (Injected on chatgpt.com & chat.openai.com)
 * High-performance, non-destructive search highlighter, draggable panel, turn capture.
 */

(function () {
  if (window.__smartAssistInjected) return;
  window.__smartAssistInjected = true;

  let currentSearchMatches = [];
  let currentMatchIndex = -1;
  let observerDebounceTimer = null;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSmartAssist);
  } else {
    initSmartAssist();
  }

  function initSmartAssist() {
    createFloatingWidget();
    attachMessageListeners();
    observeChatDOM();
  }

  /**
   * Create Draggable Floating SmartAssist Control Bar on ChatGPT
   */
  function createFloatingWidget() {
    if (document.getElementById("smartassist-widget")) return;

    const widget = document.createElement("div");
    widget.id = "smartassist-widget";
    widget.className = "smartassist-panel";
    widget.innerHTML = `
      <div class="smartassist-header" id="smartassist-header">
        <div class="smartassist-title">
          <span class="smartassist-icon">⚡</span> SmartAssist
        </div>
        <button id="smartassist-toggle-btn" title="Minimize/Expand">—</button>
      </div>
      <div class="smartassist-body" id="smartassist-body">
        <div class="smartassist-search-box">
          <input type="text" id="smartassist-input" placeholder="Search in this chat..." />
          <button id="smartassist-search-go" title="Search">🔍</button>
        </div>
        <div class="smartassist-nav-row" id="smartassist-nav-row" style="display:none;">
          <span id="smartassist-counter">0 / 0</span>
          <div class="smartassist-nav-btns">
            <button id="smartassist-prev" title="Previous match">▲</button>
            <button id="smartassist-next" title="Next match">▼</button>
            <button id="smartassist-clear-search" title="Clear highlights">✕</button>
          </div>
        </div>
        <div class="smartassist-action-btns">
          <button id="smartassist-save-chat-btn" class="smartassist-btn">📌 Bookmark Chat Turn</button>
          <button id="smartassist-summarize-btn" class="smartassist-btn secondary">⚡ Summarize Chat</button>
        </div>
      </div>
    `;

    document.body.appendChild(widget);

    // Make floating widget draggable
    makeDraggable(widget, document.getElementById("smartassist-header"));

    // Event Listeners for UI
    document.getElementById("smartassist-toggle-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      const body = document.getElementById("smartassist-body");
      body.style.display = body.style.display === "none" ? "block" : "none";
    });

    const input = document.getElementById("smartassist-input");
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") performInChatSearch(input.value);
    });

    document.getElementById("smartassist-search-go").addEventListener("click", () => {
      performInChatSearch(input.value);
    });

    document.getElementById("smartassist-prev").addEventListener("click", () => navigateMatch(-1));
    document.getElementById("smartassist-next").addEventListener("click", () => navigateMatch(1));
    document.getElementById("smartassist-clear-search").addEventListener("click", clearSearchHighlights);

    document.getElementById("smartassist-save-chat-btn").addEventListener("click", saveCurrentChatTurn);
    document.getElementById("smartassist-summarize-btn").addEventListener("click", summarizeCurrentChat);
  }

  /**
   * Draggable panel utility
   */
  function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    handle.style.cursor = "move";

    handle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      if (e.target.tagName === "BUTTON") return;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
      element.style.bottom = "auto";
      element.style.right = "auto";
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  /**
   * Listen for background or popup requests with error isolation
   */
  function attachMessageListeners() {
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        try {
          if (request.action === "HIGHLIGHT_SEARCH") {
            const input = document.getElementById("smartassist-input");
            if (input) input.value = request.term;
            performInChatSearch(request.term);
            sendResponse({ status: "success" });
          } else if (request.action === "EXTRACT_CURRENT_CHAT") {
            const turns = extractChatTurns();
            sendResponse({ status: "success", data: turns });
          }
        } catch (err) {
          sendResponse({ status: "error", message: err.message });
        }
        return true;
      });
    }
  }

  /**
   * Two-pass non-destructive TreeWalker search highlighter
   */
  function performInChatSearch(term) {
    clearSearchHighlights();
    if (!term || !term.trim()) return;

    const query = term.trim().toLowerCase();
    const articles = document.querySelectorAll("article, [data-message-author-role], .user-message, .agent-turn");
    const scope = articles.length > 0 ? Array.from(articles) : [document.body];

    const matchingNodes = [];

    // Pass 1: Traverse and collect matching text nodes without mutating DOM
    scope.forEach((container) => {
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          if (node.parentElement.closest("#smartassist-widget, script, style")) return NodeFilter.FILTER_REJECT;
          return node.nodeValue.toLowerCase().includes(query) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
      });

      let textNode;
      while ((textNode = walker.nextNode())) {
        matchingNodes.push(textNode);
      }
    });

    const highlights = [];

    // Pass 2: Mutate DOM nodes cleanly after traversal completes
    matchingNodes.forEach((textNode) => {
      const parent = textNode.parentElement;
      if (!parent) return;

      const text = textNode.nodeValue;
      const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
      const frag = document.createDocumentFragment();
      let lastIdx = 0;
      let match;

      while ((match = regex.exec(text)) !== null) {
        const matchedText = match[0];
        const before = text.substring(lastIdx, match.index);

        if (before) frag.appendChild(document.createTextNode(before));

        const mark = document.createElement("mark");
        mark.className = "smartassist-highlight";
        mark.textContent = matchedText;
        frag.appendChild(mark);
        highlights.push(mark);

        lastIdx = regex.lastIndex;
      }

      const remaining = text.substring(lastIdx);
      if (remaining) frag.appendChild(document.createTextNode(remaining));

      parent.replaceChild(frag, textNode);
    });

    currentSearchMatches = highlights;
    const navRow = document.getElementById("smartassist-nav-row");
    const counter = document.getElementById("smartassist-counter");

    if (highlights.length > 0) {
      navRow.style.display = "flex";
      currentMatchIndex = 0;
      updateMatchHighlight();
    } else {
      navRow.style.display = "flex";
      counter.textContent = "0 matches found";
    }
  }

  function navigateMatch(direction) {
    if (currentSearchMatches.length === 0) return;
    currentMatchIndex = (currentMatchIndex + direction + currentSearchMatches.length) % currentSearchMatches.length;
    updateMatchHighlight();
  }

  function updateMatchHighlight() {
    currentSearchMatches.forEach((mark, idx) => {
      if (idx === currentMatchIndex) {
        mark.classList.add("active");
        mark.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        mark.classList.remove("active");
      }
    });
    const counter = document.getElementById("smartassist-counter");
    if (counter) {
      counter.textContent = `${currentMatchIndex + 1} / ${currentSearchMatches.length}`;
    }
  }

  function clearSearchHighlights() {
    const highlights = document.querySelectorAll("mark.smartassist-highlight");
    highlights.forEach((mark) => {
      const parent = mark.parentElement;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
      }
    });
    currentSearchMatches = [];
    currentMatchIndex = -1;
    const navRow = document.getElementById("smartassist-nav-row");
    if (navRow) navRow.style.display = "none";
  }

  /**
   * Extract chat turns from ChatGPT DOM
   */
  function extractChatTurns() {
    const turns = [];
    const elements = document.querySelectorAll("article, [data-message-author-role]");

    elements.forEach((el) => {
      const role = el.getAttribute("data-message-author-role") || (el.innerText.includes("ChatGPT") ? "assistant" : "user");
      const text = el.innerText.trim();
      if (text && text.length > 2) {
        turns.push({ role, text, time: new Date().toLocaleTimeString() });
      }
    });

    return turns;
  }

  /**
   * Save active chat turn to SmartAssist memory with runtime safety guards
   */
  function saveCurrentChatTurn() {
    const turns = extractChatTurns();
    if (turns.length === 0) {
      showNotification("⚠️ No chat messages detected on page.");
      return;
    }

    const lastUser = turns.filter((t) => t.role === "user").pop();
    const lastAssistant = turns.filter((t) => t.role === "assistant").pop();

    const snippetText = `Prompt: ${lastUser ? lastUser.text : "N/A"}\n\nResponse: ${lastAssistant ? lastAssistant.text : turns[turns.length - 1].text}`;

    const payload = {
      id: Date.now().toString(),
      text: snippetText,
      title: document.title || "ChatGPT Conversation",
      time: new Date().toLocaleString(),
      source: window.location.href,
      tags: ["chatgpt-turn"],
      isFavorite: false
    };

    try {
      if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: "SAVE_MESSAGE", payload }, (resp) => {
          if (chrome.runtime.lastError) {
            fallbackLocalSave(payload);
          } else {
            showNotification(resp?.message || "Saved to SmartAssist!");
          }
        });
      } else {
        fallbackLocalSave(payload);
      }
    } catch (e) {
      fallbackLocalSave(payload);
    }
  }

  function fallbackLocalSave(payload) {
    let saved = JSON.parse(localStorage.getItem("chatRecall") || "[]");
    saved.unshift(payload);
    localStorage.setItem("chatRecall", JSON.stringify(saved));
    showNotification("Saved to local browser storage!");
  }

  /**
   * Generate quick summary
   */
  function summarizeCurrentChat() {
    const turns = extractChatTurns();
    if (turns.length === 0) {
      showNotification("⚠️ No chat text available to summarize.");
      return;
    }

    const totalWords = turns.reduce((acc, t) => acc + t.text.split(/\s+/).length, 0);
    const keyPhrases = turns
      .map((t) => t.text.substring(0, 100) + "...")
      .slice(-3)
      .join("\n- ");

    const summaryText = `📊 **Chat Summary**\n• Total Turns: ${turns.length}\n• Total Words: ~${totalWords}\n• Recent Topics:\n- ${keyPhrases}`;
    alert(summaryText);
  }

  function showNotification(msg) {
    const note = document.createElement("div");
    note.className = "smartassist-toast";
    note.textContent = msg;
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 3000);
  }

  /**
   * Throttled DOM observer to minimize CPU overhead during streaming
   */
  function observeChatDOM() {
    const observer = new MutationObserver(() => {
      if (observerDebounceTimer) return;
      observerDebounceTimer = setTimeout(() => {
        observerDebounceTimer = null;
        if (!document.getElementById("smartassist-widget")) {
          createFloatingWidget();
        }
      }, 300);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
})();
