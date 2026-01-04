const chatContainer = document.getElementById('chat-container');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const newChatBtn = document.getElementById('new-chat-btn');

let conversationHistory = [];

// Configure marked for professional table rendering
marked.setOptions({
    gfm: true,
    breaks: true
});

/**
 * Appends a message to the chat container with professional styling
 */
function appendMessage(role, content, toolCalls = []) {
    // Remove welcome screen if it exists
    const welcome = document.querySelector('.welcome-screen');
    if (welcome) welcome.remove();

    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ${role}`;

    // Meta information (e.g., "ASSISTANT", "YOU")
    const meta = document.createElement('div');
    meta.className = 'message-meta';
    
    if (role === 'assistant') {
        meta.innerHTML = `
            <div class="meta-avatar">
                <img src="assets/avatar.avif" alt="Agent">
            </div>
            <span>Financial Intelligence Agent</span>
        `;
    } else {
        meta.textContent = 'User (Banker)';
    }
    wrapper.appendChild(meta);

    // Message bubble
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    // Use marked for assistant messages to handle professional markdown/tables
    if (role === 'assistant') {
        bubble.innerHTML = marked.parse(content);
    } else {
        bubble.textContent = content; // User messages are plain text for safety
    }
    
    wrapper.appendChild(bubble);

    // Tool Execution Badges
    if (toolCalls && toolCalls.length > 0) {
        toolCalls.forEach(call => {
            const badge = document.createElement('div');
            badge.className = 'tool-badge';
            badge.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                <span>Analysis: <strong>${call.function.name}</strong></span>
            `;
            wrapper.appendChild(badge);
        });
    }

    chatContainer.appendChild(wrapper);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Shows a professional typing indicator
 */
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading';
    loadingDiv.className = 'message-wrapper assistant';
    loadingDiv.innerHTML = `
        <div class="message-meta">Agent is thinking...</div>
        <div class="message-bubble">
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.remove();
}

/**
 * Handle New Chat
 */
newChatBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to start a new chat? History will be cleared.')) {
        conversationHistory = [];
        saveHistory();
        chatContainer.innerHTML = `
            <div class="welcome-screen">
                <div class="welcome-logo">
                    <img src="assets/avatar.avif" alt="Banker Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;">
                </div>
                <h2>Financial Intelligence Agent</h2>
                <p>Welcome back. I'm ready to assist with your CRM records, banking procedures, or compliance queries.</p>
            </div>
        `;
    }
});

/**
 * Main Chat Submission
 */
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Add User Message
    const userMessage = { role: 'user', content: text };
    conversationHistory.push(userMessage);
    saveHistory();
    appendMessage('user', text);
    
    // Reset textarea height
    userInput.value = '';
    userInput.style.height = 'auto';

    // 2. Show Loading
    showLoading();

    // 3. Sliding Window Strategy (Keep last 15 messages)
    const MAX_HISTORY = 15;
    let historyPayload = conversationHistory.slice(-MAX_HISTORY);

    // Safety: ensure it doesn't start with a 'tool' message
    while (historyPayload.length > 0 && historyPayload[0].role === 'tool') {
        historyPayload.shift();
    }

    try {
        // Detect environment: use localhost for local dev, and relative /orchestrator/ for production (Nginx proxy)
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const API_URL = isLocal ? 'http://localhost:3000/v1/agent/chat' : '/orchestrator/v1/agent/chat';

        // 4. Call Orchestrator
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                context: { userId: 'banker-001', roles: ['representative', 'advisor'] },
                messages: historyPayload
            })
        });

        if (!response.ok) throw new Error('Communication failure with core services.');

        const data = await response.json();
        removeLoading();

        // 5. Update local history from server response
        conversationHistory = data.messages;
        saveHistory();
        
        // 6. Render the latest assistant response
        const lastMsg = conversationHistory[conversationHistory.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
            appendMessage('assistant', lastMsg.content, lastMsg.tool_calls);
        }

    } catch (error) {
        removeLoading();
        appendMessage('assistant', `System Alert: ${error.message}. Please verify core orchestrator service status.`);
    }
});

/**
 * Persistence Layer: Handle session history
 */
function saveHistory() {
    sessionStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
}

function loadHistory() {
    const saved = sessionStorage.getItem('conversationHistory');
    if (saved) {
        conversationHistory = JSON.parse(saved);
        // Clean render
        chatContainer.innerHTML = '';
        conversationHistory.forEach(msg => {
            // Only render user and assistant messages for the UI
            // SKIP intermediate assistant messages that have no content (tool-only turns)
            if (msg.role === 'user' || (msg.role === 'assistant' && msg.content && msg.content.trim())) {
                appendMessage(msg.role, msg.content, msg.tool_calls);
            }
        });
    }
}

// Initial session load
loadHistory();
userInput.focus();
