// script.js — client-side simulation only
const users = [
  { id: 1, username: 'alice', password: 'wonderland' },
  { id: 2, username: 'bob', password: 'builder' }
];

const $ = id => document.getElementById(id);
const usernameEl = $('username');
const passwordEl = $('password');
const sqlEl = $('constructed-sql');
const vulnResult = $('vuln-result');
const safeResult = $('safe-result');

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
function mathEqualityIsTrue(str) {
  // find patterns like 2+2=4 or  10 + 2 = 12 (numbers only)
  const m = str.match(/([0-9]+\s*\+\s*[0-9]+)\s*=\s*([0-9]+)/);
  if (!m) return false;
  try {
    const left = m[1].replace(/\s+/g, '');
    const parts = left.split('+').map(x => parseInt(x, 10));
    const sum = parts.reduce((a,b)=>a+b,0);
    const right = parseInt(m[2], 10);
    return sum === right;
  } catch(e) {
    return false;
  }
}

// detect classic OR always true pattern: ' OR '1'='1  (very basic)
function detectsClassicOrTrue(str) {
  return /(\bOR\b|or)\s*['"]?\s*1\s*['"]?\s*=\s*['"]?\s*1/i.test(str);
}

// Simulated "execution" of the vulnerable query
function simulateVulnerable(sql, username, password) {
  // If the constructed SQL contains an always-true expression, we simulate a bypass:
  if (mathEqualityIsTrue(sql) || detectsClassicOrTrue(sql)) {
    return { success: true, reason: 'Detected always-true expression in WHERE clause (simulated bypass)' };
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

  const result = simulateVulnerable(constructed, u, p);
  vulnResult.textContent = result.success ? `VULNERABLE: ${result.reason}` : `VULNERABLE: ${result.reason}`;
  vulnResult.style.color = result.success ? 'green' : 'black';
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
}

$('try-vuln').addEventListener('click', tryVulnerable);
$('try-safe').addEventListener('click', trySafe);

// prefill example
usernameEl.value = 'alice';
passwordEl.value = 'wonderland';
tryVulnerable();
