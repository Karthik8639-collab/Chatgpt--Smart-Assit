document.getElementById("searchBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const searchTerm = document.getElementById("searchBox").value;

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: searchInChat,
    args: [searchTerm]
  });
});

function searchInChat(term) {
  const messages = document.querySelectorAll("div");
  let found = false;
  messages.forEach(div => {
    if (div.innerText && div.innerText.toLowerCase().includes(term.toLowerCase())) {
      div.style.backgroundColor = "#ffff99"; // Highlight
      found = true;
    }
  });
  if (!found) alert("No matching text found.");
}
