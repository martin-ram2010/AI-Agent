const fetch = require(" node-fetch\); fetch(\http://localhost:3001/v1/admin/logs?limit=1\).then(r => r.json()).then(l => console.log(\Last Log:\, l[0].timestamp, l[0].type)).catch(console.error)
