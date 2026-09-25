/**
 * ChatGPT SmartAssist - Background Service Worker (Manifest V3)
 * Robust background manager with context menu isolation, safe message dispatching, and storage deduplication.
 */

// Initialize storage & context menus safely on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["chatRecall", "smartAssistSettings"], (result) => {
    if (!result.chatRecall) {
      chrome.storage.local.set({ chatRecall: [] });
    }
    if (!result.smartAssistSettings) {
      chrome.storage.local.set({
        smartAssistSettings: {
          autoCapture: false,
          highlightColor: "#fef08a",
          theme: "dark"
        }
      });
    }
  });

  // Re-register context menus cleanly to prevent duplicate ID runtime errors
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "smartassist_save_selection",
      title: "📌 Save to SmartAssist Memory",
      contexts: ["selection"]
    });

    chrome.contextMenus.create({
      id: "smartassist_search_selection",
      title: "🔍 Search this text in SmartAssist",
      contexts: ["selection"]
    });
  });
});

// Handle Context Menu Actions with runtime error suppression
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.id) return;

  if (info.menuItemId === "smartassist_save_selection" && info.selectionText) {
    const selectedText = info.selectionText.trim();
    saveMessageToStorage({
      id: Date.now().toString(),
      title: selectedText.substring(0, 40) + (selectedText.length > 40 ? "..." : ""),
      text: selectedText,
      source: tab.url || "Web Page",
      time: new Date().toLocaleString(),
      tags: ["quick-save"],
      isFavorite: false
    });
  } else if (info.menuItemId === "smartassist_search_selection" && info.selectionText) {
    chrome.tabs.sendMessage(
      tab.id,
      {
        action: "HIGHLIGHT_SEARCH",
        term: info.selectionText
      },
      () => {
        // Suppress error if active tab is not a supported content script page
        if (chrome.runtime.lastError) {
          // Silent catch
        }
      }
    );
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SAVE_MESSAGE") {
    saveMessageToStorage(request.payload, sendResponse);
    return true; // Keep message channel open for async response
  }

  if (request.action === "GET_ALL_MESSAGES") {
    chrome.storage.local.get(["chatRecall"], (result) => {
      sendResponse({ status: "success", data: result.chatRecall || [] });
    });
    return true;
  }

  if (request.action === "CLEAR_ALL_MESSAGES") {
    chrome.storage.local.set({ chatRecall: [] }, () => {
      sendResponse({ status: "success" });
    });
    return true;
  }
});

/**
 * Persist memory item safely with deduplication
 */
function saveMessageToStorage(item, callback) {
  chrome.storage.local.get(["chatRecall"], (result) => {
    const messages = result.chatRecall || [];
    const exists = messages.some((m) => m.text === item.text);

    if (!exists) {
      messages.unshift(item);
      chrome.storage.local.set({ chatRecall: messages }, () => {
        if (callback) callback({ status: "success", message: "Saved to SmartAssist memory!" });
      });
    } else if (callback) {
      callback({ status: "duplicate", message: "Message already exists in memory." });
    }
  });
}
