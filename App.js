let savedMessages = JSON.parse(localStorage.getItem("chatRecall")) || [];

function renderMessages() {
  const container = document.getElementById("messages");
  container.innerHTML = "";

  savedMessages.forEach((msg, index) => {
    const div = document.createElement("div");
    div.className = "message";
    div.innerHTML = `<strong>[${msg.time}]</strong><br>${msg.text}`;
    container.appendChild(div);
  });
}

function clearMessages() {
  localStorage.removeItem("chatRecall");
  savedMessages = [];
  renderMessages();
}

// Simple search filter
document.getElementById("searchBar").addEventListener("input", function () {
  const value = this.value.toLowerCase();
  const container = document.getElementById("messages");
  container.innerHTML = "";

  savedMessages
    .filter((msg) => msg.text.toLowerCase().includes(value))
    .forEach((msg) => {
      const div = document.createElement("div");
      div.className = "message";
      div.innerHTML = `<strong>[${msg.time}]</strong><br>${msg.text}`;
      container.appendChild(div);
    });
});

function saveMessage(text) {
  const timestamp = new Date().toLocaleString();
  const newMsg = { text, time: timestamp };
  savedMessages.push(newMsg);
  localStorage.setItem("chatRecall", JSON.stringify(savedMessages));
}

// Demo insert
saveMessage("This is your first saved message from ChatGPT.");
saveMessage("Karthik just built ChatRecall AI Phase 1 🚀");
renderMessages();
