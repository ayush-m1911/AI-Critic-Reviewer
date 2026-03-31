/* =============================================================
   AI Critic — app.js
   Full, working integration with FastAPI backend.
   ============================================================= */

const BASE_URL = "http://127.0.0.1:8000";

// ── Global State ──────────────────────────────────────────────
let currentConversationId = null;
let isSending = false;

// ── DOM References ────────────────────────────────────────────
const conversationList  = document.getElementById("conversationList");
const messagesContainer = document.getElementById("messagesContainer");
const messageInput      = document.getElementById("messageInput");
const sendBtn           = document.getElementById("sendBtn");
const headerTitle       = document.getElementById("headerTitle");
const headerSubtitle    = document.getElementById("headerSubtitle");
const headerStatus      = document.getElementById("headerStatus");
const statusDot         = document.getElementById("statusDot");
const statusText        = document.getElementById("statusText");
const welcomeScreen     = document.getElementById("welcomeScreen");
const inputHint         = document.getElementById("inputHint");
const toast             = document.getElementById("toast");

// ── Toast Notifications ───────────────────────────────────────
let toastTimer = null;

function showToast(message, type = "info") {
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

// ── Status Indicator ──────────────────────────────────────────
function setStatus(state) {
  if (state === "thinking") {
    statusDot.classList.add("thinking");
    statusText.textContent = "Thinking…";
  } else {
    statusDot.classList.remove("thinking");
    statusText.textContent = "Online";
  }
}

// ── Input Auto-resize ─────────────────────────────────────────
messageInput.addEventListener("input", () => {
  messageInput.style.height = "auto";
  messageInput.style.height = Math.min(messageInput.scrollHeight, 160) + "px";
});

// ── Send on Shift+Enter / Enter ───────────────────────────────
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (!sendBtn.disabled) sendMessage();
  }
});

// ── Enable / Disable Input ────────────────────────────────────
function enableInput() {
  messageInput.disabled = false;
  messageInput.placeholder = "Type your message… (Enter to send, Shift+Enter for new line)";
  sendBtn.disabled = false;
  inputHint.textContent = "Press Enter to send · Shift+Enter for a new line";
}

function disableInput() {
  messageInput.disabled = true;
  messageInput.placeholder = "Select or create a conversation to start chatting…";
  sendBtn.disabled = true;
  inputHint.textContent = "Create or select a conversation to begin";
}

// ── Header Update ─────────────────────────────────────────────
function updateHeader(title, subtitle) {
  headerTitle.textContent = title || "AI Critic";
  headerSubtitle.textContent = subtitle || "";
}

// ── Welcome / Chat View Toggle ────────────────────────────────
function showWelcome() {
  welcomeScreen.style.display = "flex";
}

function hideWelcome() {
  welcomeScreen.style.display = "none";
}

// ── Format Date ───────────────────────────────────────────────
function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch { return ""; }
}

// ─────────────────────────────────────────────────────────────
//  1. createConversation()
// ─────────────────────────────────────────────────────────────
async function createConversation() {
  console.log("⏳ createConversation() called");

  try {
    const res = await fetch(`${BASE_URL}/conversation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("❌ /conversation POST failed:", res.status, err);
      showToast("Failed to create conversation.", "error");
      return;
    }

    const data = await res.json();
    console.log("✅ New conversation response:", data);

    currentConversationId = data.conversation_id;
    console.log("📌 currentConversationId set to:", currentConversationId);

    // Clear messages and switch to chat view
    clearMessages();
    hideWelcome();
    enableInput();
    messageInput.focus();

    updateHeader(
      `Conversation #${currentConversationId}`,
      "New conversation started"
    );

    setStatus("online");

    // Reload sidebar list and highlight new conversation
    await loadConversations();

  } catch (error) {
    console.error("❌ Network error in createConversation:", error);
    showToast("Network error. Is the backend running?", "error");
  }
}

// ─────────────────────────────────────────────────────────────
//  2. loadConversations()
// ─────────────────────────────────────────────────────────────
async function loadConversations() {
  console.log("⏳ loadConversations() called");

  try {
    const res = await fetch(`${BASE_URL}/conversations`);

    if (!res.ok) {
      console.error("❌ /conversations GET failed:", res.status);
      return;
    }

    const data = await res.json();
    console.log("✅ Conversations loaded:", data);

    conversationList.innerHTML = "";

    if (!data || data.length === 0) {
      conversationList.innerHTML =
        '<div class="empty-state-sidebar">No conversations yet.<br>Start a new chat!</div>';
      return;
    }

    // Sort newest first
    const sorted = [...data].sort((a, b) => b.id - a.id);

    sorted.forEach((conv) => {
      const item = document.createElement("div");
      item.className = "conv-item" + (conv.id === currentConversationId ? " active" : "");
      item.dataset.id = conv.id;

      item.innerHTML = `
        <div class="conv-icon">💬</div>
        <div class="conv-info">
          <div class="conv-title">${escapeHtml(conv.title || `Conversation #${conv.id}`)}</div>
          <div class="conv-date">${formatDate(conv.created_at)}</div>
        </div>
      `;

      item.addEventListener("click", () => loadMessages(conv.id));
      conversationList.appendChild(item);
    });

  } catch (error) {
    console.error("❌ Network error in loadConversations:", error);
  }
}

// ─────────────────────────────────────────────────────────────
//  3. loadMessages(id)
// ─────────────────────────────────────────────────────────────
async function loadMessages(id) {
  console.log(`⏳ loadMessages() called — conversation id: ${id}`);

  currentConversationId = id;
  console.log("📌 currentConversationId set to:", currentConversationId);

  // Highlight active item
  document.querySelectorAll(".conv-item").forEach((el) => {
    el.classList.toggle("active", parseInt(el.dataset.id) === id);
  });

  updateHeader(
    `Conversation #${id}`,
    "Loading history…"
  );

  clearMessages();
  hideWelcome();

  try {
    const res = await fetch(`${BASE_URL}/conversation/${id}`);

    if (!res.ok) {
      console.error("❌ /conversation/:id GET failed:", res.status);
      showToast("Failed to load conversation history.", "error");
      return;
    }

    const messages = await res.json();
    console.log(`✅ Messages for conversation ${id}:`, messages);

    if (messages.length === 0) {
      updateHeader(`Conversation #${id}`, "No messages yet — say something!");
    } else {
      updateHeader(`Conversation #${id}`, `${messages.length} message${messages.length !== 1 ? "s" : ""}`);
      messages.forEach((msg) => appendMessage(msg.role, msg.content, false));
      scrollToBottom();
    }

    enableInput();
    messageInput.focus();
    setStatus("online");

  } catch (error) {
    console.error("❌ Network error in loadMessages:", error);
    showToast("Network error while loading messages.", "error");
  }
}

// ─────────────────────────────────────────────────────────────
//  4. sendMessage()
// ─────────────────────────────────────────────────────────────
async function sendMessage() {
  const text = messageInput.value.trim();

  // Guard: no empty messages
  if (!text) {
    showToast("Please type a message first.", "error");
    return;
  }

  // Guard: no conversation selected
  if (!currentConversationId) {
    console.warn("⚠️ sendMessage called but currentConversationId is null");
    showToast("Please create or select a conversation first.", "error");
    return;
  }

  // Guard: don't double-send
  if (isSending) return;

  const payload = {
    text: text,
    conversation_id: currentConversationId
  };

  console.log("📤 Sending to /analyze — conversation_id:", currentConversationId);
  console.log("📦 Payload:", JSON.stringify(payload, null, 2));

  // Add user message immediately
  appendMessage("user", text);
  messageInput.value = "";
  messageInput.style.height = "auto";
  scrollToBottom();

  // Show thinking indicator
  const thinkingEl = showThinking();
  setSending(true);
  setStatus("thinking");

  try {
    const res = await fetch(`${BASE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log("📥 /analyze response status:", res.status);

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ /analyze failed:", res.status, errText);
      removeThinking(thinkingEl);
      appendMessage("assistant", `⚠️ Error ${res.status}: ${errText || "Something went wrong."}`);
      showToast("Backend returned an error.", "error");
      return;
    }

    const data = await res.json();
    console.log("✅ /analyze response data:", data);

    const analysis = data.analysis;

    if (!analysis) {
      console.warn("⚠️ Response missing 'analysis' field:", data);
      removeThinking(thinkingEl);
      appendMessage("assistant", "⚠️ Received an empty response from the AI.");
      return;
    }

    removeThinking(thinkingEl);
    appendMessage("assistant", analysis);
    scrollToBottom();

    // Update subtitle with message count
    const currentMsgs = messagesContainer.querySelectorAll(".message-row").length;
    updateHeader(`Conversation #${currentConversationId}`, `${currentMsgs} message${currentMsgs !== 1 ? "s" : ""}`);

  } catch (error) {
    console.error("❌ Network error in sendMessage:", error);
    removeThinking(thinkingEl);
    appendMessage("assistant", "⚠️ Network error — Is the backend running at " + BASE_URL + "?");
    showToast("Network error. Check your connection.", "error");
  } finally {
    setSending(false);
    setStatus("online");
    messageInput.focus();
  }
}

// ─────────────────────────────────────────────────────────────
//  Helper: appendMessage(role, content, animate = true)
// ─────────────────────────────────────────────────────────────
function appendMessage(role, content, animate = true) {
  const row = document.createElement("div");
  row.className = `message-row ${role}`;
  if (!animate) row.style.animation = "none";

  const isUser = role === "user";

  row.innerHTML = `
    <div class="avatar ${isUser ? "avatar-user" : "avatar-ai"}">
      ${isUser ? "U" : "✦"}
    </div>
    <div class="bubble ${isUser ? "bubble-user" : "bubble-ai"}">
      ${escapeHtml(content)}
    </div>
  `;

  messagesContainer.appendChild(row);
  if (animate) scrollToBottom();
}

// ─────────────────────────────────────────────────────────────
//  Helper: Thinking Indicator
// ─────────────────────────────────────────────────────────────
function showThinking() {
  const row = document.createElement("div");
  row.className = "thinking-row";
  row.id = "thinkingIndicator";

  row.innerHTML = `
    <div class="avatar avatar-ai">✦</div>
    <div class="thinking-bubble">
      <div class="dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <span>AI is thinking…</span>
    </div>
  `;

  messagesContainer.appendChild(row);
  scrollToBottom();
  return row;
}

function removeThinking(el) {
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

// ─────────────────────────────────────────────────────────────
//  Helper: clearMessages()
// ─────────────────────────────────────────────────────────────
function clearMessages() {
  // Remove all children except the welcome screen
  const children = [...messagesContainer.children];
  children.forEach((child) => {
    if (child.id !== "welcomeScreen") child.remove();
  });
}

// ─────────────────────────────────────────────────────────────
//  Helper: scrollToBottom()
// ─────────────────────────────────────────────────────────────
function scrollToBottom() {
  requestAnimationFrame(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });
}

// ─────────────────────────────────────────────────────────────
//  Helper: setSending(bool)
// ─────────────────────────────────────────────────────────────
function setSending(bool) {
  isSending = bool;
  sendBtn.disabled = bool;
  messageInput.disabled = bool;
}

// ─────────────────────────────────────────────────────────────
//  Helper: escapeHtml(str)
//  Prevents XSS when rendering user/AI content
// ─────────────────────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─────────────────────────────────────────────────────────────
//  Boot
// ─────────────────────────────────────────────────────────────
(async function init() {
  console.log("🚀 AI Critic frontend initializing…");
  console.log("🔗 Backend URL:", BASE_URL);

  disableInput();
  showWelcome();
  setStatus("online");

  await loadConversations();

  console.log("✅ Initialization complete. currentConversationId:", currentConversationId);
})();