const chatContainer = document.getElementById('chat-container');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

let conversationHistory = [];

function appendMessage(role, content, toolCalls = []) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    // Use marked for assistant messages to handle markdown
    const formattedContent = role === 'assistant' ? marked.parse(content) : escapeHtml(content);
    let html = `<div class="bubble">${formattedContent}</div>`;

    if (toolCalls && toolCalls.length > 0) {
        toolCalls.forEach(call => {
            html += `
                <div class="tool-execution">
                    ⚡ Executing <span class="tool-name">${call.function.name}</span>
                </div>
            `;
        });
    }

    messageDiv.innerHTML = html;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Remove welcome message if it exists
    const welcome = document.querySelector('.welcome-message');
    if (welcome) welcome.remove();
}

function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading';
    loadingDiv.className = 'message assistant';
    loadingDiv.innerHTML = `
        <div class="loading-dots">
            <span></span><span></span><span></span>
        </div>
    `;
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.remove();
}

// 0. New Chat Logic
const newChatBtn = document.getElementById('new-chat-btn');
newChatBtn.addEventListener('click', () => {
    conversationHistory = [];
    chatContainer.innerHTML = `
        <div class="welcome-message">
          <h2>Hello, I'm your AI Orchestrator</h2>
          <p>
            I can help you query Salesforce, search knowledge bases, and more.
            What's on your mind?
          </p>
        </div>
    `;
});

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Add User Message
    const userMessage = { role: 'user', content: text };
    conversationHistory.push(userMessage);
    appendMessage('user', text);
    userInput.value = '';

    // 2. Show Loading
    showLoading();

    // 3. Sliding Window Strategy: Keep last 15 messages to optimize tokens
    const MAX_HISTORY = 15;
    let historyPayload = conversationHistory.slice(-MAX_HISTORY);

    // Safety: ensure it doesn't start with a 'tool' message as it requires a preceding 'assistant' call
    while (historyPayload.length > 0 && historyPayload[0].role === 'tool') {
        historyPayload.shift();
    }

    try {
        // 4. Call Orchestrator
        const response = await fetch('http://localhost:3000/v1/agent/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                context: { userId: 'web-user', roles: ['admin'] },
                messages: historyPayload
            })
        });

        if (!response.ok) throw new Error('Failed to connect to orchestrator');

        const data = await response.json();
        removeLoading();

        // 5. Update local history from the "Clean" server response
        // Merge server response back into local history
        conversationHistory = data.messages;
        
        // 6. Render the LAST assistant response
        const lastMsg = conversationHistory[conversationHistory.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
            appendMessage('assistant', lastMsg.content, lastMsg.tool_calls);
        }

    } catch (error) {
        removeLoading();
        appendMessage('assistant', `Error: ${error.message}. Is the Orchestrator running on port 3000?`);
    }
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
