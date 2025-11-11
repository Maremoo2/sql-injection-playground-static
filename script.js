// script.js — client-side simulation only
const users = [
  { id: 1, username: 'alice', password: 'wonderland' }
];

const $ = id => document.getElementById(id);
const usernameEl = $('username');
const passwordEl = $('password');
const sqlEl = $('constructed-sql');
const vulnResult = $('vuln-result');
const safeResult = $('safe-result');
const usernameIndicator = $('username-indicator');
const passwordIndicator = $('password-indicator');

function escapeForSql(str) {
  // show how naive concatenation appears (not used to query)
  return str.replace(/'/g, "''");
}

function buildVulnerableSQL(username, password) {
  const u = username;
  const p = password;
  return `SELECT id, username FROM users WHERE username = '${u}' AND password = '${p}' LIMIT 1;`;
}

// detect always-true math expressions like "2+2=4" (simple)
// Return a list of matching always-true expressions found in the input string.
// Each match is an object: { type: 'arith'|'eq'|'or', text: '1+1=2' }
function findAlwaysTrueExpressions(sql) {
  const matches = [];
  if (!sql || typeof sql !== 'string') return matches;

  // Note: we intentionally do NOT skip matches inside single-quoted literals
  // so expressions like '2+2=4' will be treated as always-true for the demo.

  // arithmetic: a + b = c  (supports + - * /)
  const arithRe = /([0-9]+)\s*([+\-\*\/])\s*([0-9]+)\s*=\s*([0-9]+)/g;
  let m;
  while ((m = arithRe.exec(sql)) !== null) {
    try {
  const start = m.index;
  const end = start + m[0].length;
      const a = parseInt(m[1], 10);
      const op = m[2];
      const b = parseInt(m[3], 10);
      const right = parseInt(m[4], 10);
      let val;
      if (op === '+') val = a + b;
      else if (op === '-') val = a - b;
      else if (op === '*') val = a * b;
      else if (op === '/') val = b !== 0 ? a / b : null;
      if (val === right) matches.push({ type: 'arith', text: m[0], index: start });
    } catch (e) {
      // ignore
    }
  }

  // numeric equality: 1 = 1
  const eqRe = /([0-9]+)\s*=\s*([0-9]+)/g;
  while ((m = eqRe.exec(sql)) !== null) {
    try {
      const start = m.index;
      const left = parseInt(m[1], 10);
      const right = parseInt(m[2], 10);
      if (left === right) matches.push({ type: 'eq', text: m[0], index: start });
    } catch (e) {}
  }

  // classic OR '1'='1' pattern (we allow it even if inside quotes because attackers often use closing-quote techniques)
  const orRe = /(\bOR\b|\bor\b)\s*['"]?\s*1\s*['"]?\s*=\s*['"]?\s*1/gi;
  while ((m = orRe.exec(sql)) !== null) {
    const start = m.index;
    // OR patterns are likely intentional injection when they appear; accept them even if inside quotes
    matches.push({ type: 'or', text: m[0], index: start });
  }

  return matches;
}

function mathEqualityIsTrue(str) {
  return findAlwaysTrueExpressions(str).length > 0;
}

// detect classic OR always true pattern: ' OR '1'='1  (very basic)
function detectsClassicOrTrue(str) {
  return /(\bOR\b|or)\s*['"]?\s*1\s*['"]?\s*=\s*['"]?\s*1/i.test(str);
}

// Simulated "execution" of the vulnerable query
function simulateVulnerable(sql, username, password) {
  // If the constructed SQL contains an always-true expression, we simulate a bypass:
  const matches = findAlwaysTrueExpressions(sql);
  if (matches.length > 0 || detectsClassicOrTrue(sql)) {
    const details = matches.length > 0 ? matches.map(m => m.text).join(', ') : 'OR 1=1';
    return { success: true, reason: `Detected always-true expression in WHERE clause (simulated bypass): ${details}` };
  }

  // else attempt to match exactly against the in-browser users list
  const found = users.find(u => u.username === username && u.password === password);
  if (found) return { success: true, reason: `Credentials matched user '${found.username}'` };
  return { success: false, reason: 'No match — login failed' };
}

function tryVulnerable() {
  const u = usernameEl.value.trim();
  const p = passwordEl.value.trim();
  const constructed = buildVulnerableSQL(u, p);
  sqlEl.textContent = constructed;

  // log constructed SQL so people can inspect it in DevTools
  console.log('Constructed SQL (simulated):', constructed);

  const result = simulateVulnerable(constructed, u, p);
  // Decide messaging and color: show green for successful logins or simulated bypasses
  const matchesForDisplay = findAlwaysTrueExpressions(constructed);
  const orMatchForDisplay = detectsClassicOrTrue(constructed);
  if (result.success) {
    if ((matchesForDisplay && matchesForDisplay.length > 0) || orMatchForDisplay) {
      // Friendly, non-technical label when the WHERE clause evaluates true
      vulnResult.textContent = `VULNERABLE: statement True`;
    } else {
      vulnResult.textContent = `VULNERABLE: Login succeeded (credentials match)`;
    }
    // use the green used by the OK indicator
    vulnResult.style.color = '#064e3b';
  } else {
    vulnResult.textContent = `VULNERABLE: ${result.reason}`;
    vulnResult.style.color = '#111';
  }

  // If the vulnerable simulation detected an always-true expression, show a bypass indicator on the password field
  try {
    const matches = findAlwaysTrueExpressions(constructed);
    const orMatch = detectsClassicOrTrue(constructed);
    if ((matches && matches.length > 0) || orMatch) {
      if (passwordIndicator) {
        // For demo clarity, show the bypass as a "Correct password" indicator
        passwordIndicator.textContent = 'Correct password';
        passwordIndicator.className = 'field-indicator ok';
      }
      // keep username indicator as-is (it already shows whether username exists)
    } else {
      // otherwise refresh normal indicators
      updateFieldIndicators();
    }
  } catch (e) {
    // ignore errors
  }
}

function trySafe() {
  const u = usernameEl.value.trim();
  const p = passwordEl.value.trim();

  // safe: strict equality check against user store
  const found = users.find(x => x.username === u && x.password === p);
  if (found) {
    safeResult.textContent = `SAFE: Login succeeded as ${found.username}`;
    safeResult.style.color = 'green';
  } else {
    safeResult.textContent = 'SAFE: Login failed (no SQL parsing/evaluation performed)';
    safeResult.style.color = 'black';
  }
  // Refresh the small field indicators so the password field shows Wrong/Correct according to the safe check
  try {
    updateFieldIndicators();
  } catch (e) {
    // ignore
  }
}

$('try-vuln').addEventListener('click', tryVulnerable);
$('try-safe').addEventListener('click', trySafe);

// Share Demo button functionality
$('share-demo').addEventListener('click', () => {
  const u = usernameEl.value.trim();
  const p = passwordEl.value.trim();
  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = `${baseUrl}?username=${encodeURIComponent(u)}&password=${encodeURIComponent(p)}&run=1`;
  
  // Copy to clipboard
  navigator.clipboard.writeText(shareUrl).then(() => {
    const msg = $('share-message');
    msg.textContent = '✓ Link copied to clipboard! Share it to let others try this demo.';
    msg.style.display = 'block';
    setTimeout(() => {
      msg.style.display = 'none';
    }, 3000);
  }).catch(() => {
    // Fallback if clipboard API is not available
    const msg = $('share-message');
    msg.textContent = `Share this link: ${shareUrl}`;
    msg.style.display = 'block';
  });
});

// Update the small username/password indicators based on the in-memory users list
function updateFieldIndicators() {
  const u = usernameEl.value.trim();
  const p = passwordEl.value.trim();

  // Username indicator: correct if username exists in users
  const user = users.find(x => x.username === u);
  if (!usernameIndicator) return;
  if (!u) {
    usernameIndicator.textContent = '';
    usernameIndicator.className = 'field-indicator neutral';
  } else if (user) {
    usernameIndicator.textContent = 'Correct username';
    usernameIndicator.className = 'field-indicator ok';
  } else {
    usernameIndicator.textContent = 'Unknown username';
    usernameIndicator.className = 'field-indicator bad';
  }

  // Password indicator: green only if it matches the found user's password
  if (!passwordIndicator) return;
  if (!p) {
    passwordIndicator.textContent = '';
    passwordIndicator.className = 'field-indicator neutral';
  } else if (user && user.password === p) {
    passwordIndicator.textContent = 'Correct password';
    passwordIndicator.className = 'field-indicator ok';
  } else {
    passwordIndicator.textContent = 'Wrong password';
    passwordIndicator.className = 'field-indicator bad';
  }
}

// wire indicators to live input events
usernameEl.addEventListener('input', updateFieldIndicators);
passwordEl.addEventListener('input', updateFieldIndicators);

// update on load
updateFieldIndicators();

// prefill example
usernameEl.value = 'alice';
passwordEl.value = 'wonderland';
tryVulnerable();

// (removed dynamic copy-link button; demo link button was removed to simplify UI)

// On load: if URL has username/password params, prefill and optionally run the vulnerable simulation
try {
  const params = new URLSearchParams(location.search);
  const u = params.get('username');
  const p = params.get('password');
  const run = params.get('run');
  if (u) usernameEl.value = u;
  if (p) passwordEl.value = p;
  updateFieldIndicators();
  // If run is set and the autorun toggle is checked, auto-run the vulnerable simulation
  try {
    const autorunToggle = document.getElementById('autorun-toggle');
    const autorunEnabled = autorunToggle ? autorunToggle.checked : true;
    if (run === '1' && autorunEnabled) {
      tryVulnerable();
    }
  } catch (e) {
    // ignore toggle errors
    if (run === '1') tryVulnerable();
  }
} catch (e) {
  // ignore URL parsing errors
}
