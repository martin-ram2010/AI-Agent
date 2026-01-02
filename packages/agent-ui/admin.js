const logBody = document.getElementById('log-body');
const refreshBtn = document.getElementById('refresh-logs');
let currentLogs = [];

async function fetchLogs() {
    try {
        const response = await fetch('http://127.0.0.1:3000/v1/admin/logs?limit=50');
        currentLogs = await response.json();
        renderLogs(currentLogs);
    } catch (error) {
        console.error('Failed to fetch logs:', error);
        logBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: #ef4444;">Failed to load logs. Is the orchestrator running?</td></tr>`;
    }
}

function renderLogs(logs) {
    logBody.innerHTML = '';
    logs.forEach((log, index) => {
        const row = document.createElement('tr');
        const timestamp = new Date(log.timestamp).toLocaleTimeString();
        
        row.innerHTML = `
            <td>${timestamp}</td>
            <td><span class="type-badge">${log.type}</span></td>
            <td>${log.stage}</td>
            <td>${log.message}</td>
            <td><span class="status-${log.status}">${log.status}</span></td>
            <td>
                <div class="metadata-cell" onclick="viewPayload(${index})">
                    ${log.metadata ? 'View Details' : 'N/A'}
                </div>
            </td>
        `;
        logBody.appendChild(row);
    });
}

function viewPayload(index) {
    const log = currentLogs[index];
    if (!log || !log.metadata) return;

    const payloadWindow = window.open('', '_blank', 'width=800,height=600,resizable=yes,scrollbars=yes');
    const jsonString = JSON.stringify(log.metadata, null, 2);

    payloadWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Log Payload: ${log.type}</title>
            <style>
                body {
                    background: #0f172a;
                    color: #e2e8f0;
                    font-family: 'Fira Code', 'Courier New', monospace;
                    padding: 20px;
                    margin: 0;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #334155;
                    padding-bottom: 15px;
                    margin-bottom: 15px;
                }
                .tag {
                    background: #334155;
                    color: #38bdf8;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: bold;
                }
                pre {
                    background: #1e293b;
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid #334155;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    font-size: 13px;
                    margin: 0;
                    line-height: 1.5;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <span class="tag">${log.type} @ ${new Date(log.timestamp).toLocaleTimeString()}</span>
                <span style="color: #94a3b8; font-size: 12px;">Stage: ${log.stage}</span>
            </div>
            <pre>${jsonString}</pre>
        </body>
        </html>
    `);
    payloadWindow.document.close();
}

refreshBtn.addEventListener('click', fetchLogs);
setInterval(fetchLogs, 5000);
fetchLogs();
